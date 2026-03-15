type RuntimeOverride = {
  bilibiliCookie?: string;
  bilibiliUserAgent?: string;
  xiaohongshuCookie?: string;
  xiaohongshuUserAgent?: string;
};

declare global {
  var __runtimeConfigOverride__: RuntimeOverride | undefined;
}

function getStore() {
  if (!globalThis.__runtimeConfigOverride__) {
    globalThis.__runtimeConfigOverride__ = {};
  }
  return globalThis.__runtimeConfigOverride__;
}

const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

function getLlmApiKey(provider: string): string {
  switch (provider) {
    case "kimi":
      return process.env.KIMI_API_KEY ?? "";
    case "qwen":
      return process.env.QWEN_API_KEY ?? "";
    case "openai":
      return process.env.OPENAI_API_KEY ?? "";
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY ?? "";
    default:
      return process.env.LLM_API_KEY ?? "";
  }
}

function getLlmBaseUrl(provider: string): string | undefined {
  switch (provider) {
    case "kimi":
      return process.env.KIMI_BASE_URL;
    case "qwen":
      return process.env.QWEN_BASE_URL;
    case "openai":
      return process.env.OPENAI_BASE_URL;
    case "anthropic":
      return process.env.ANTHROPIC_BASE_URL;
    default:
      return process.env.LLM_BASE_URL;
  }
}

function getLlmModel(provider: string): string {
  switch (provider) {
    case "kimi":
      return process.env.KIMI_MODEL ?? "kimi-latest";
    case "qwen":
      return process.env.QWEN_MODEL ?? "qwen-turbo";
    case "openai":
      return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    case "anthropic":
      return process.env.ANTHROPIC_MODEL ?? "claude-3-haiku-20240307";
    default:
      return process.env.LLM_MODEL ?? "kimi-latest";
  }
}

export function getRuntimeConfig() {
  const override = getStore();
  const provider = process.env.LLM_PROVIDER as "kimi" | "openai" | "anthropic" | "qwen" | undefined;
  
  return {
    bilibiliCookie: override.bilibiliCookie ?? process.env.BILIBILI_COOKIE ?? "",
    bilibiliUserAgent: override.bilibiliUserAgent ?? process.env.BILIBILI_USER_AGENT ?? DEFAULT_USER_AGENT,
    xiaohongshuCookie: override.xiaohongshuCookie ?? process.env.XIAOHONGSHU_COOKIE ?? "",
    xiaohongshuUserAgent: override.xiaohongshuUserAgent ?? process.env.XIAOHONGSHU_USER_AGENT ?? DEFAULT_USER_AGENT,
    qwenAsrApiKey: process.env.QWEN3_ASR_API_KEY ?? "",
    qwenAsrBaseUrl: process.env.QWEN3_ASR_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    qwenAsrModel: process.env.QWEN3_ASR_MODEL ?? "qwen3-asr-flash",
    llmProvider: provider ?? "kimi",
    llmModel: getLlmModel(provider ?? "kimi"),
    llmApiKey: getLlmApiKey(provider ?? "kimi"),
    llmBaseUrl: getLlmBaseUrl(provider ?? "kimi")
  };
}

export function setRuntimeConfig(input: RuntimeOverride) {
  const store = getStore();
  if (typeof input.bilibiliCookie === "string") {
    store.bilibiliCookie = input.bilibiliCookie;
  }
  if (typeof input.bilibiliUserAgent === "string") {
    store.bilibiliUserAgent = input.bilibiliUserAgent;
  }
  if (typeof input.xiaohongshuCookie === "string") {
    store.xiaohongshuCookie = input.xiaohongshuCookie;
  }
  if (typeof input.xiaohongshuUserAgent === "string") {
    store.xiaohongshuUserAgent = input.xiaohongshuUserAgent;
  }
}
