import { getRuntimeConfig } from "@/lib/server/runtime-config-store";

export function buildBilibiliHeaders() {
  const config = getRuntimeConfig();
  const headers: Record<string, string> = {
    "User-Agent": config.bilibiliUserAgent,
    Referer: "https://www.bilibili.com/"
  };

  if (config.bilibiliCookie) {
    headers.Cookie = config.bilibiliCookie;
  }
  return headers;
}
