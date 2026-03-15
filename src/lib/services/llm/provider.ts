import type { LLMGenerateParams, LLMResult } from "@/types/summary";
import type { QAMessage, SubtitleReference } from "@/types";
import { parseLLMResponse } from "./parser";
import { buildPrompt, buildMarkdownFromStructured, buildQAPrompt } from "./prompt-builder";
import type { PromptBuildParams } from "@/types/summary";

interface OpenAICompatibleResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
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

const DEFAULT_TIMEOUT = 60000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export class LLMProvider {
  private params: LLMGenerateParams;

  constructor(params: LLMGenerateParams) {
    this.params = {
      temperature: 0.7,
      maxTokens: 4000,
      timeout: DEFAULT_TIMEOUT,
      ...params
    };
  }

  async generateSummary(promptParams: PromptBuildParams): Promise<LLMResult> {
    const prompt = buildPrompt(promptParams);

    switch (this.params.provider) {
      case "kimi":
        return this.callKimi(prompt);
      case "openai":
        return this.callOpenAI(prompt);
      case "anthropic":
        return this.callAnthropic(prompt);
      case "qwen":
        return this.callQwen(prompt);
      default:
        return {
          rawText: "",
          success: false,
          error: `不支持的 provider 类型: ${this.params.provider}`
        };
    }
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
      videoTitle: params.videoTitle
    });

    const result = await this.callWithSystem(
      prompt,
      "你是一位专业的视频内容问答助手，擅长基于字幕片段回答用户问题。回答要准确、简洁、有帮助。"
    );

    if (!result.success) {
      return {
        answer: "",
        references: [],
        success: false,
        error: result.error
      };
    }

    return {
      answer: result.content,
      references: params.references,
      success: true
    };
  }

  async translateSubtitles(prompt: string): Promise<TranslationResult> {
    const result = await this.callWithSystem(
      prompt,
      "你是一位专业的字幕翻译助手。请严格按照要求的格式输出翻译结果，保持时间戳和索引不变。"
    );

    if (!result.success) {
      return {
        translatedText: "",
        success: false,
        error: result.error
      };
    }

    return {
      translatedText: result.content,
      success: true
    };
  }

  private async callWithSystem(
    prompt: string,
    systemContent: string
  ): Promise<{ content: string; success: boolean; error?: string }> {
    switch (this.params.provider) {
      case "kimi":
        return this.callKimiRaw(prompt, systemContent);
      case "openai":
        return this.callOpenAIRaw(prompt, systemContent);
      case "anthropic":
        return this.callAnthropicRaw(prompt, systemContent);
      case "qwen":
        return this.callQwenRaw(prompt, systemContent);
      default:
        return {
          content: "",
          success: false,
          error: `不支持的 provider 类型: ${this.params.provider}`
        };
    }
  }

  private async callKimiRaw(
    prompt: string,
    systemContent: string,
    retryCount = 0
  ): Promise<{ content: string; success: boolean; error?: string }> {
    const baseUrl = this.params.baseUrl ?? "https://api.moonshot.cn/v1";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.params.timeout);

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.params.apiKey}`
        },
        body: JSON.stringify({
          model: this.params.model,
          messages: [
            { role: "system", content: systemContent },
            { role: "user", content: prompt }
          ],
          temperature: this.params.temperature,
          max_tokens: this.params.maxTokens
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Kimi API 错误 (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as OpenAICompatibleResponse;
      const content = data.choices[0]?.message?.content ?? "";

      return { content, success: true };
    } catch (error) {
      if (retryCount < MAX_RETRIES && this.shouldRetry(error)) {
        await this.delay(RETRY_DELAY * (retryCount + 1));
        return this.callKimiRaw(prompt, systemContent, retryCount + 1);
      }

      return {
        content: "",
        success: false,
        error: `Kimi API 调用失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async callOpenAIRaw(
    prompt: string,
    systemContent: string,
    retryCount = 0
  ): Promise<{ content: string; success: boolean; error?: string }> {
    const baseUrl = this.params.baseUrl ?? "https://api.openai.com/v1";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.params.timeout);

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.params.apiKey}`
        },
        body: JSON.stringify({
          model: this.params.model,
          messages: [
            { role: "system", content: systemContent },
            { role: "user", content: prompt }
          ],
          temperature: this.params.temperature,
          max_tokens: this.params.maxTokens
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API 错误 (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as OpenAICompatibleResponse;
      const content = data.choices[0]?.message?.content ?? "";

      return { content, success: true };
    } catch (error) {
      if (retryCount < MAX_RETRIES && this.shouldRetry(error)) {
        await this.delay(RETRY_DELAY * (retryCount + 1));
        return this.callOpenAIRaw(prompt, systemContent, retryCount + 1);
      }

      return {
        content: "",
        success: false,
        error: `OpenAI API 调用失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async callAnthropicRaw(
    prompt: string,
    systemContent: string,
    retryCount = 0
  ): Promise<{ content: string; success: boolean; error?: string }> {
    const baseUrl = this.params.baseUrl ?? "https://api.anthropic.com/v1";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.params.timeout);

      const response = await fetch(`${baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.params.apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: this.params.model,
          max_tokens: this.params.maxTokens ?? 4000,
          temperature: this.params.temperature,
          system: systemContent,
          messages: [{ role: "user", content: prompt }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API 错误 (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as {
        content: Array<{ type: string; text: string }>;
        usage: { input_tokens: number; output_tokens: number };
      };
      const content = data.content[0]?.text ?? "";

      return { content, success: true };
    } catch (error) {
      if (retryCount < MAX_RETRIES && this.shouldRetry(error)) {
        await this.delay(RETRY_DELAY * (retryCount + 1));
        return this.callAnthropicRaw(prompt, systemContent, retryCount + 1);
      }

      return {
        content: "",
        success: false,
        error: `Anthropic API 调用失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async callQwenRaw(
    prompt: string,
    systemContent: string,
    retryCount = 0
  ): Promise<{ content: string; success: boolean; error?: string }> {
    const baseUrl = this.params.baseUrl ?? "https://dashscope.aliyuncs.com/compatible-mode/v1";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.params.timeout);

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.params.apiKey}`
        },
        body: JSON.stringify({
          model: this.params.model,
          messages: [
            { role: "system", content: systemContent },
            { role: "user", content: prompt }
          ],
          temperature: this.params.temperature,
          max_tokens: this.params.maxTokens
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Qwen API 错误 (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as OpenAICompatibleResponse;
      const content = data.choices[0]?.message?.content ?? "";

      return { content, success: true };
    } catch (error) {
      if (retryCount < MAX_RETRIES && this.shouldRetry(error)) {
        await this.delay(RETRY_DELAY * (retryCount + 1));
        return this.callQwenRaw(prompt, systemContent, retryCount + 1);
      }

      return {
        content: "",
        success: false,
        error: `Qwen API 调用失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async callKimi(prompt: string, retryCount = 0): Promise<LLMResult> {
    const baseUrl = this.params.baseUrl ?? "https://api.moonshot.cn/v1";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.params.timeout);

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.params.apiKey}`
        },
        body: JSON.stringify({
          model: this.params.model,
          messages: [
            {
              role: "system",
              content: "你是一个专业的视频内容分析师，擅长从字幕中提取结构化信息。请严格按照要求的 JSON 格式输出。"
            },
            { role: "user", content: prompt }
          ],
          temperature: this.params.temperature,
          max_tokens: this.params.maxTokens
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Kimi API 错误 (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as OpenAICompatibleResponse;
      const content = data.choices[0]?.message?.content ?? "";

      const parsed = parseLLMResponse(content);

      if (parsed.success && parsed.structured) {
        return {
          rawText: content,
          structured: parsed.structured,
          markdown: buildMarkdownFromStructured(parsed.structured),
          usage: {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens
          },
          success: true
        };
      }

      return {
        rawText: content,
        success: false,
        error: parsed.error ?? "解析 LLM 响应失败"
      };
    } catch (error) {
      if (retryCount < MAX_RETRIES && this.shouldRetry(error)) {
        await this.delay(RETRY_DELAY * (retryCount + 1));
        return this.callKimi(prompt, retryCount + 1);
      }

      return {
        rawText: "",
        success: false,
        error: `Kimi API 调用失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async callOpenAI(prompt: string, retryCount = 0): Promise<LLMResult> {
    const baseUrl = this.params.baseUrl ?? "https://api.openai.com/v1";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.params.timeout);

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.params.apiKey}`
        },
        body: JSON.stringify({
          model: this.params.model,
          messages: [
            {
              role: "system",
              content: "You are a professional video content analyst. Extract structured information from subtitles and output strictly in the requested JSON format."
            },
            { role: "user", content: prompt }
          ],
          temperature: this.params.temperature,
          max_tokens: this.params.maxTokens,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API 错误 (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as OpenAICompatibleResponse;
      const content = data.choices[0]?.message?.content ?? "";

      const parsed = parseLLMResponse(content);

      if (parsed.success && parsed.structured) {
        return {
          rawText: content,
          structured: parsed.structured,
          markdown: buildMarkdownFromStructured(parsed.structured),
          usage: {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens
          },
          success: true
        };
      }

      return {
        rawText: content,
        success: false,
        error: parsed.error ?? "解析 LLM 响应失败"
      };
    } catch (error) {
      if (retryCount < MAX_RETRIES && this.shouldRetry(error)) {
        await this.delay(RETRY_DELAY * (retryCount + 1));
        return this.callOpenAI(prompt, retryCount + 1);
      }

      return {
        rawText: "",
        success: false,
        error: `OpenAI API 调用失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async callAnthropic(prompt: string, retryCount = 0): Promise<LLMResult> {
    const baseUrl = this.params.baseUrl ?? "https://api.anthropic.com/v1";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.params.timeout);

      const response = await fetch(`${baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.params.apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: this.params.model,
          max_tokens: this.params.maxTokens ?? 4000,
          temperature: this.params.temperature,
          system: "You are a professional video content analyst. Extract structured information from subtitles and output strictly in the requested JSON format.",
          messages: [{ role: "user", content: prompt }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API 错误 (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as {
        content: Array<{ type: string; text: string }>;
        usage: { input_tokens: number; output_tokens: number };
      };
      const content = data.content[0]?.text ?? "";

      const parsed = parseLLMResponse(content);

      if (parsed.success && parsed.structured) {
        return {
          rawText: content,
          structured: parsed.structured,
          markdown: buildMarkdownFromStructured(parsed.structured),
          usage: {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens
          },
          success: true
        };
      }

      return {
        rawText: content,
        success: false,
        error: parsed.error ?? "解析 LLM 响应失败"
      };
    } catch (error) {
      if (retryCount < MAX_RETRIES && this.shouldRetry(error)) {
        await this.delay(RETRY_DELAY * (retryCount + 1));
        return this.callAnthropic(prompt, retryCount + 1);
      }

      return {
        rawText: "",
        success: false,
        error: `Anthropic API 调用失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async callQwen(prompt: string, retryCount = 0): Promise<LLMResult> {
    const baseUrl = this.params.baseUrl ?? "https://dashscope.aliyuncs.com/compatible-mode/v1";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.params.timeout);

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.params.apiKey}`
        },
        body: JSON.stringify({
          model: this.params.model,
          messages: [
            {
              role: "system",
              content: "你是一个专业的视频内容分析师，擅长从字幕中提取结构化信息。请严格按照要求的 JSON 格式输出。"
            },
            { role: "user", content: prompt }
          ],
          temperature: this.params.temperature,
          max_tokens: this.params.maxTokens
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Qwen API 错误 (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as OpenAICompatibleResponse;
      const content = data.choices[0]?.message?.content ?? "";

      const parsed = parseLLMResponse(content);

      if (parsed.success && parsed.structured) {
        return {
          rawText: content,
          structured: parsed.structured,
          markdown: buildMarkdownFromStructured(parsed.structured),
          usage: {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens
          },
          success: true
        };
      }

      return {
        rawText: content,
        success: false,
        error: parsed.error ?? "解析 LLM 响应失败"
      };
    } catch (error) {
      if (retryCount < MAX_RETRIES && this.shouldRetry(error)) {
        await this.delay(RETRY_DELAY * (retryCount + 1));
        return this.callQwen(prompt, retryCount + 1);
      }

      return {
        rawText: "",
        success: false,
        error: `Qwen API 调用失败: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private shouldRetry(error: unknown): boolean {
    if (error instanceof Error) {
      const retryableErrors = ["timeout", "network", "rate limit", "too many requests", "503", "502", "504", "aborted", "abort"];
      return retryableErrors.some((e) => error.message.toLowerCase().includes(e.toLowerCase()));
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export function createLLMProvider(params: LLMGenerateParams): LLMProvider {
  return new LLMProvider(params);
}
