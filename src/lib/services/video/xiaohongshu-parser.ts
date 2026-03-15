import type { PlatformParseResult, PlatformParser, PlatformTranscriptResult } from "@/lib/services/video/platform-parser";
import { transcribeByQwen3Asr } from "@/lib/services/asr/qwen3-asr";
import { transcribeChunked } from "@/lib/services/asr/chunked-asr";
import { cleanupDownloaderArtifacts, runXiaohongshuExtractor } from "@/lib/services/video/python-downloader";
import { getRuntimeConfig } from "@/lib/server/runtime-config-store";

const XHS_MAX_ATTEMPTS = 2;
const LONG_VIDEO_THRESHOLD_SECONDS = 300;

function parseXiaohongshuId(inputUrl: string) {
  const normalized = decodeURIComponent(inputUrl);
  const itemMatch = normalized.match(/xiaohongshu\.com\/(?:explore|discovery\/item|note)\/([a-zA-Z0-9]+)/);
  if (itemMatch) {
    return itemMatch[1];
  }

  const shortMatch = normalized.match(/xhslink\.com\/([a-zA-Z0-9]+)/i);
  if (shortMatch) {
    return shortMatch[1];
  }
  throw new Error("无法从小红书链接中解析视频 ID");
}

async function resolveShortLinkIfNeeded(inputUrl: string) {
  if (!inputUrl.includes("xhslink.com")) {
    return inputUrl;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch(inputUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal
    });
    return response.url || inputUrl;
  } catch {
    return inputUrl;
  } finally {
    clearTimeout(timeout);
  }
}

function buildMeta(input: {
  resolvedUrl: string;
  extracted?: {
    videoId?: string;
    title?: string;
    author?: string;
    duration?: number;
    timestamp?: number | "";
  };
}) {
  const fallbackId = parseXiaohongshuId(input.resolvedUrl);
  const videoId = (input.extracted?.videoId || "").trim() || fallbackId;
  const duration = Number(input.extracted?.duration || 0) || 0;
  const publishAt =
    typeof input.extracted?.timestamp === "number" && input.extracted.timestamp > 0
      ? new Date(input.extracted.timestamp * 1000).toISOString()
      : new Date().toISOString();

  return {
    platform: "xiaohongshu" as const,
    videoId,
    title: input.extracted?.title?.trim() || `小红书视频 ${videoId.slice(0, 8)}`,
    author: input.extracted?.author?.trim() || "小红书作者",
    duration,
    publishAt,
    pages: [
      {
        cid: 1,
        page: 1,
        title: "默认分段",
        duration
      }
    ]
  };
}

async function withRetry<T>(task: () => Promise<T>, attempts = XHS_MAX_ATTEMPTS): Promise<T> {
  let lastError: unknown = null;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function toReadableError(error: unknown, phase: "parse" | "download" | "asr" | "chunk") {
  const raw = error instanceof Error ? error.message : String(error);
  const normalized = raw.toLowerCase();

  if (phase === "asr" && normalized.includes("404")) {
    return "ASR 服务不可用（404），请检查 QWEN3_ASR_BASE_URL 与 QWEN3_ASR_MODEL 配置";
  }
  if (phase === "chunk" || (normalized.includes("ffmpeg") && normalized.includes("not found"))) {
    return "音频切片失败：ffmpeg 未安装，请先安装 ffmpeg：https://ffmpeg.org/download.html";
  }
  if (normalized.includes("片段") && normalized.includes("转写失败")) {
    return `长视频转写失败：${raw}，该片段已重试2次仍无法转写`;
  }
  if (
    normalized.includes("403")
    || normalized.includes("401")
    || normalized.includes("forbidden")
    || normalized.includes("cookie")
    || normalized.includes("login")
    || normalized.includes("captcha")
  ) {
    return "小红书访问被拒绝，请在设置页更新有效 Cookie 后重试";
  }
  if (normalized.includes("timed out") || normalized.includes("timeout")) {
    return "小红书处理超时，请稍后重试或提高 XIAOHONGSHU_DOWNLOADER_TIMEOUT_MS";
  }
  if (normalized.includes("no video formats found") || normalized.includes("unable to extract")) {
    return "小红书解析失败（可能触发风控或链接无可用视频流），请更换链接或更新 Cookie";
  }
  return raw;
}

export class XiaohongshuParser implements PlatformParser {
  async parse(url: string): Promise<PlatformParseResult> {
    const config = getRuntimeConfig();
    try {
      const resolvedUrl = await resolveShortLinkIfNeeded(url);
      const extracted = await withRetry(
        () =>
          runXiaohongshuExtractor({
            url: resolvedUrl,
            userAgent: config.xiaohongshuUserAgent,
            cookie: config.xiaohongshuCookie,
            download: false
          }),
        XHS_MAX_ATTEMPTS
      );
      const meta = buildMeta({
        resolvedUrl,
        extracted: extracted.meta
      });
      return {
        meta,
        hasNativeSubtitle: false
      };
    } catch (error) {
      throw new Error(toReadableError(error, "parse"));
    }
  }

  async fetchTranscript(url: string): Promise<PlatformTranscriptResult> {
    const config = getRuntimeConfig();
    try {
      const resolvedUrl = await resolveShortLinkIfNeeded(url);
      const downloaded = await withRetry(
        () =>
          runXiaohongshuExtractor({
            url: resolvedUrl,
            userAgent: config.xiaohongshuUserAgent,
            cookie: config.xiaohongshuCookie,
            download: true
          }),
        XHS_MAX_ATTEMPTS
      );

      const meta = buildMeta({
        resolvedUrl,
        extracted: downloaded.meta
      });

      const shouldChunk = meta.duration > LONG_VIDEO_THRESHOLD_SECONDS;

      try {
        let asrResult;
        if (shouldChunk) {
          asrResult = await transcribeChunked(downloaded.audioPath, {
            onLog: (message) => console.log(message),
            maxAttempts: XHS_MAX_ATTEMPTS
          });
        } else {
          asrResult = await withRetry(
            () => transcribeByQwen3Asr(downloaded.audioPath),
            XHS_MAX_ATTEMPTS
          );
        }

        return {
          meta,
          subtitleSource: "asr",
          segments: asrResult.segments,
          fullText: asrResult.fullText
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes("ffmpeg") || message.includes("FfmpegNotFoundError")) {
          throw new Error(toReadableError(error, "chunk"));
        }
        if (message.includes("片段") && message.includes("转写失败")) {
          throw new Error(toReadableError(error, "chunk"));
        }
        if (message.includes("Qwen3-ASR") || message.includes("ASR")) {
          throw new Error(toReadableError(error, "asr"));
        }
        throw new Error(toReadableError(error, "download"));
      } finally {
        await cleanupDownloaderArtifacts(downloaded.workDir);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("长视频转写失败")) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("ffmpeg") || message.includes("FfmpegNotFoundError")) {
        throw new Error(toReadableError(error, "chunk"));
      }
      throw new Error(toReadableError(error, "download"));
    }
  }
}
