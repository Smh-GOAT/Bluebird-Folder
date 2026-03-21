import { NextRequest, NextResponse } from "next/server";
import { getHistoryById, saveHistory } from "@/lib/server/sidebar-store";
import { createLLMProvider } from "@/lib/services/llm";
import type { LLMProviderType, SummaryTemplate, SummaryStructured } from "@/types/summary";

const DEFAULT_PROVIDER: LLMProviderType = "qwen";
const DEFAULT_MODELS: Record<LLMProviderType, string> = {
  kimi: "moonshot-v1-8k",
  openai: "gpt-4o-mini",
  anthropic: "claude-3-haiku-20240307",
  qwen: "qwen3.5-plus"
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      historyId: string;
      template?: string;
      language?: string;
      detail?: "brief" | "standard" | "detailed";
      showTimestamp?: boolean;
      showEmoji?: boolean;
    };

    const { historyId } = body;

    if (!historyId) {
      return NextResponse.json(
        { code: 40001, data: null, message: "historyId 不能为空" },
        { status: 400 }
      );
    }

    const history = getHistoryById(historyId);
    if (!history) {
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

    if (history.summaryJson && history.summaryMarkdown) {
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

    const provider = (process.env.LLM_PROVIDER as LLMProviderType) ?? DEFAULT_PROVIDER;
    const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`];

    if (!apiKey) {
      return NextResponse.json(
        { code: 50002, data: null, message: `未配置 ${provider.toUpperCase()}_API_KEY 环境变量` },
        { status: 500 }
      );
    }

    const model = process.env[`${provider.toUpperCase()}_MODEL`] ?? DEFAULT_MODELS[provider];
    const baseUrl = process.env[`${provider.toUpperCase()}_BASE_URL`];

    const llmProvider = createLLMProvider({
      provider,
      apiKey,
      model,
      baseUrl,
      temperature: 0.7,
      maxTokens: 4000,
      timeout: 120000
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

    const updatedHistory = saveHistory({
      ...history,
      summaryJson: result.structured as SummaryStructured,
      summaryMarkdown: result.markdown ?? ""
    });

    return NextResponse.json({
      code: 0,
      data: {
        historyId,
        summaryJson: updatedHistory.summaryJson,
        summaryMarkdown: updatedHistory.summaryMarkdown,
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
