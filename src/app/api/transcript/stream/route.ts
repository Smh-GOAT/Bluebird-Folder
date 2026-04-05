import { z } from "zod";
import { detectPlatform, getPlatformParser } from "@/lib/services/video/platform-parser";
import { forsionFromRequest } from "@/lib/forsion/proxy";
import { extractToken } from "@/lib/forsion/client";
import { createForsionLLMProvider } from "@/lib/forsion/llm-client";
import { getSummaryPreferences_server } from "@/lib/summary-preferences-server";

const schema = z.object({ url: z.string().url() });

const DEFAULT_MODEL_ID = process.env.FORSION_MODEL_ID || "qwen3.5-plus";

function createHistoryId(platform: string, videoId: string) {
  return `${platform}-${videoId}-${Date.now()}`;
}

export async function POST(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const body = schema.parse(await request.json());
        const platform = detectPlatform(body.url);
        if (!platform) {
          send({ type: "error", message: "当前仅支持 Bilibili / 小红书 链接" });
          controller.close();
          return;
        }

        const parser = getPlatformParser(body.url);

        send({ type: "progress", percent: 2, label: "开始处理" });

        const transcript = await parser.fetchTranscript(body.url, (percent, label) => {
          // Scale transcript progress to 0-75%
          const scaled = Math.round(percent * 0.75);
          send({ type: "progress", percent: scaled, label });
        });

        send({ type: "progress", percent: 76, label: "保存记录" });

        const historyId = createHistoryId(transcript.meta.platform, transcript.meta.videoId);
        const client = forsionFromRequest(request);
        await client.fetch("/api/bluebird/histories", {
          method: "POST",
          body: JSON.stringify({
            id: historyId,
            title: transcript.meta.title,
            platform: transcript.meta.platform,
            createdAt: new Date().toISOString(),
            videoId: transcript.meta.videoId,
            videoUrl: body.url,
            author: transcript.meta.author,
            duration: transcript.meta.duration,
            publishAt: transcript.meta.publishAt,
            subtitleSource: transcript.subtitleSource,
            subtitlesArray: transcript.segments,
            fullText: transcript.fullText,
            summaryJson: null,
            summaryMarkdown: null,
            folderId: null,
          }),
        });

        // Step 3: Auto-generate summary
        send({ type: "progress", percent: 80, label: "生成总结" });

        const token = extractToken(request);
        const prefs = getSummaryPreferences_server();
        const llmProvider = createForsionLLMProvider({
          modelId: DEFAULT_MODEL_ID,
          token,
          temperature: 0.7,
          maxTokens: 4000,
          timeout: 120_000,
        });

        const summaryResult = await llmProvider.generateSummary({
          subtitles: transcript.segments,
          videoMeta: {
            title: transcript.meta.title,
            author: transcript.meta.author,
            duration: transcript.meta.duration,
            platform: transcript.meta.platform,
          },
          template: prefs.template,
          language: prefs.language,
          detail: prefs.detail,
          showTimestamp: prefs.showTimestamp,
          showEmoji: prefs.showEmoji,
        });

        if (summaryResult.success && summaryResult.structured) {
          send({ type: "progress", percent: 95, label: "保存总结" });

          await client.fetch(`/api/bluebird/histories/${historyId}`, {
            method: "PUT",
            body: JSON.stringify({
              summaryJson: summaryResult.structured,
              summaryMarkdown: summaryResult.markdown ?? "",
            }),
          });
        } else {
          // Summary failed but transcript succeeded — not fatal
          console.error("[stream] summary generation failed:", summaryResult.error);
        }

        send({
          type: "complete",
          percent: 100,
          label: "完成",
          historyId,
          meta: transcript.meta,
        });
      } catch (error) {
        send({
          type: "error",
          message: error instanceof Error ? error.message : "转录失败",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
