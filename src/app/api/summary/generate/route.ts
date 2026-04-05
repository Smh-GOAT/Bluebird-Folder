import { NextRequest, NextResponse } from "next/server";
import { forsionFromRequest } from "@/lib/forsion/proxy";
import { extractToken } from "@/lib/forsion/client";
import { createForsionLLMProvider } from "@/lib/forsion/llm-client";
import type {
  SummaryDetailLevel,
  SummaryTemplate,
  SummaryStructured
} from "@/types/summary";

const DEFAULT_MODEL_ID = process.env.FORSION_MODEL_ID || "qwen3.5-plus";

interface HistoryResponse {
  code: number;
  data: {
    id: string;
    title: string;
    author?: string;
    duration?: number;
    platform: string;
    subtitlesArray?: Array<{ start: number; end: number; text: string }>;
    summaryJson?: SummaryStructured | null;
    summaryMarkdown?: string | null;
    [key: string]: unknown;
  };
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      historyId: string;
      template?: string;
      language?: string;
      detail?: SummaryDetailLevel;
      showTimestamp?: boolean;
      showEmoji?: boolean;
      modelId?: string;
      force?: boolean;
    };

    const { historyId } = body;

    if (!historyId) {
      return NextResponse.json(
        { code: 40001, data: null, message: "historyId 不能为空" },
        { status: 400 }
      );
    }

    // Fetch history from Forsion Backend
    const client = forsionFromRequest(request);
    let history: HistoryResponse["data"];
    try {
      const result = await client.fetch<HistoryResponse>(`/api/bluebird/histories/${historyId}`);
      history = result.data;
    } catch {
      return NextResponse.json(
        { code: 40401, data: null, message: "历史记录不存在" },
        { status: 404 }
      );
    }

    if (!history.subtitlesArray || history.subtitlesArray.length === 0) {
      return NextResponse.json(
        { code: 40002, data: null, message: "该历史记录没有字幕数据" },
        { status: 400 }
      );
    }

    if (!body.force && history.summaryJson && history.summaryMarkdown) {
      return NextResponse.json({
        code: 0,
        data: {
          historyId,
          summaryJson: history.summaryJson,
          summaryMarkdown: history.summaryMarkdown,
          cached: true
        },
        message: "success"
      });
    }

    // Use Forsion LLM via chat/completions
    const token = extractToken(request);
    const llmProvider = createForsionLLMProvider({
      modelId: body.modelId ?? DEFAULT_MODEL_ID,
      token,
      temperature: 0.7,
      maxTokens: 4000,
      timeout: 120000,
    });

    const result = await llmProvider.generateSummary({
      subtitles: history.subtitlesArray,
      videoMeta: {
        title: history.title,
        author: history.author,
        duration: history.duration,
        platform: history.platform
      },
      template: (body.template ?? "general") as SummaryTemplate,
      language: body.language ?? "zh",
      detail: body.detail ?? "standard",
      showTimestamp: body.showTimestamp ?? true,
      showEmoji: body.showEmoji ?? true
    });

    if (!result.success || !result.structured) {
      return NextResponse.json(
        { code: 50003, data: null, message: result.error ?? "生成总结失败" },
        { status: 500 }
      );
    }

    // Update history via Forsion Backend
    await client.fetch(`/api/bluebird/histories/${historyId}`, {
      method: "PUT",
      body: JSON.stringify({
        summaryJson: result.structured,
        summaryMarkdown: result.markdown ?? "",
      }),
    });

    return NextResponse.json({
      code: 0,
      data: {
        historyId,
        summaryJson: result.structured,
        summaryMarkdown: result.markdown ?? "",
        cached: false,
        usage: result.usage
      },
      message: "success"
    });
  } catch (error) {
    console.error("[POST /api/summary/generate] error:", error);
    return NextResponse.json(
      { code: 50001, data: null, message: error instanceof Error ? error.message : "生成总结失败" },
      { status: 500 }
    );
  }
}
