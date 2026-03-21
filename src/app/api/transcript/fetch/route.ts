import { z } from "zod";
import { ErrorCodes } from "@/lib/services/common/error-codes";
import { errorResponse, successResponse } from "@/lib/services/common/api-response";
import { detectPlatform, getPlatformParser } from "@/lib/services/video/platform-parser";
import { saveHistory } from "@/lib/server/sidebar-store";

const schema = z.object({
  url: z.string().url()
});

function createHistoryId(platform: string, videoId: string) {
  return `${platform}-${videoId}-${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const platform = detectPlatform(body.url);
    if (!platform) {
      return errorResponse(ErrorCodes.UNSUPPORTED_PLATFORM, "当前仅支持 Bilibili / 小红书 链接");
    }
    const parser = getPlatformParser(body.url);
    const transcript = await parser.fetchTranscript(body.url);
    const historyId = createHistoryId(transcript.meta.platform, transcript.meta.videoId);

    saveHistory({
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
      folderId: null
    });
    return successResponse({
      meta: transcript.meta,
      subtitleSource: transcript.subtitleSource,
      segments: transcript.segments,
      fullText: transcript.fullText,
      historyId
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.INVALID_URL, "请提供合法的视频链接");
    }
    return errorResponse(
      ErrorCodes.SUBTITLE_FETCH_FAILED,
      error instanceof Error ? error.message : "字幕获取失败",
      500
    );
  }
}
