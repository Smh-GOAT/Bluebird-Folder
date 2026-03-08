type RuntimeOverride = {
  bilibiliCookie?: string;
  bilibiliUserAgent?: string;
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

export function getRuntimeConfig() {
  const override = getStore();
  return {
    bilibiliCookie: override.bilibiliCookie ?? process.env.BILIBILI_COOKIE ?? "",
    bilibiliUserAgent: override.bilibiliUserAgent ?? process.env.BILIBILI_USER_AGENT ?? DEFAULT_USER_AGENT,
    qwenAsrApiKey: process.env.QWEN3_ASR_API_KEY ?? "",
    qwenAsrBaseUrl:
      process.env.QWEN3_ASR_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1/audio/transcriptions",
    qwenAsrModel: process.env.QWEN3_ASR_MODEL ?? "qwen3-asr"
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
}
