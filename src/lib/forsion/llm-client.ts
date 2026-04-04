/**
 * Forsion LLM Client — routes LLM calls through Forsion Backend's
 * /api/chat/completions endpoint instead of calling providers directly.
 *
 * This provides: centralized API key management, credit billing,
 * usage tracking, and model management.
 */

import type { QAMessage, SubtitleReference } from "@/types";
import type { LLMResult, PromptBuildParams } from "@/types/summary";
import { parseLLMResponse, validateWordCount } from "@/lib/services/llm/parser";
import { buildMarkdownFromStructured, buildPrompt, buildQAPrompt } from "@/lib/services/llm/prompt-builder";

interface ForsionChatCompletionResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface QAResult {
  answer: string;
  references: SubtitleReference[];
  success: boolean;
  error?: string;
}

interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
  success: boolean;
  error?: string;
}

interface ForsionLLMParams {
  /** Forsion model_id (from global_models table) */
  modelId: string;
  /** JWT token for authenticating with Forsion Backend */
  token: string | null;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

const FORSION_API_URL =
  process.env.NEXT_PUBLIC_FORSION_API_URL || "http://localhost:3001";

export class ForsionLLMProvider {
  private params: Required<Pick<ForsionLLMParams, "modelId" | "temperature" | "maxTokens" | "timeout">> & { token: string | null };

  constructor(params: ForsionLLMParams) {
    this.params = {
      modelId: params.modelId,
      token: params.token,
      temperature: params.temperature ?? 0.7,
      maxTokens: params.maxTokens ?? 4000,
      timeout: params.timeout ?? 60000,
    };
  }

  async generateSummary(promptParams: PromptBuildParams): Promise<LLMResult> {
    const prompt = buildPrompt(promptParams);

    const result = await this.callChat([
      { role: "system", content: "You are a professional video summarization assistant. Output valid JSON." },
      { role: "user", content: prompt },
    ]);

    if (!result.success) {
      return { rawText: "", success: false, error: result.error };
    }

    const parsed = parseLLMResponse(result.content);
    if (!parsed.success || !parsed.structured) {
      return { rawText: result.content, success: false, error: parsed.error ?? "解析 LLM 响应失败" };
    }

    const markdown = buildMarkdownFromStructured(parsed.structured);
    const wordCountValidation = validateWordCount(markdown, promptParams.detail ?? "standard");

    return {
      rawText: result.content,
      structured: parsed.structured,
      markdown,
      wordCountValidation,
      success: true,
      usage: result.usage,
    };
  }

  async generateQA(params: {
    question: string;
    references: SubtitleReference[];
    previousMessages: QAMessage[];
    videoTitle?: string;
  }): Promise<QAResult> {
    const prompt = buildQAPrompt({
      question: params.question,
      references: params.references,
      previousMessages: params.previousMessages,
      videoTitle: params.videoTitle,
    });

    const systemPrompt =
      "你是一位专业的视频内容问答助手。请严格遵守以下规则：\n" +
      "1. 只基于提供的字幕片段回答问题，不要编造信息。\n" +
      "2. 如果字幕中没有足够信息，明确回答「根据字幕无法回答此问题」。\n" +
      "3. 回答要准确、简洁，引用时使用 [MM:SS] 时间戳格式。\n" +
      "4. 不要过度推断，只陈述字幕中明确提到的内容。";

    const result = await this.callChat([
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ]);

    if (!result.success) {
      return { answer: "", references: [], success: false, error: result.error };
    }

    return { answer: result.content, references: params.references, success: true };
  }

  async translateSubtitles(prompt: string): Promise<TranslationResult> {
    const result = await this.callChat([
      { role: "system", content: "你是一位专业的字幕翻译助手。请严格按要求输出，保持时间戳和索引不变。" },
      { role: "user", content: prompt },
    ]);

    if (!result.success) {
      return { translatedText: "", success: false, error: result.error };
    }

    return { translatedText: result.content, success: true };
  }

  private async callChat(
    messages: Array<{ role: string; content: string }>
  ): Promise<{
    content: string;
    success: boolean;
    error?: string;
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Project-Source": "bluebird",
    };
    if (this.params.token) {
      headers["Authorization"] = `Bearer ${this.params.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.params.timeout);

    try {
      const res = await fetch(`${FORSION_API_URL}/api/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model_id: this.params.modelId,
          messages,
          temperature: this.params.temperature,
          max_tokens: this.params.maxTokens,
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail = (body as Record<string, unknown>).detail ?? res.statusText;
        if (res.status === 402) {
          return { content: "", success: false, error: "积分不足，请充值后再试" };
        }
        return { content: "", success: false, error: `Forsion LLM ${res.status}: ${detail}` };
      }

      const data: ForsionChatCompletionResponse = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";

      return {
        content,
        success: true,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { content: "", success: false, error: "请求超时" };
      }
      return { content: "", success: false, error: error instanceof Error ? error.message : "Unknown error" };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export function createForsionLLMProvider(params: ForsionLLMParams): ForsionLLMProvider {
  return new ForsionLLMProvider(params);
}
