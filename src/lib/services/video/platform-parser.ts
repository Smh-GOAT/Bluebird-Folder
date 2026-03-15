import type { SubtitleSegment, SubtitleSource, VideoMeta } from "@/types";
import { buildBilibiliHeaders } from "@/lib/services/video/request-headers";
import { fetchBilibiliMeta } from "@/lib/services/video/bilibili-parser";
import { fetchBilibiliNativeSubtitles } from "@/lib/services/video/bilibili-subtitle";
import { cleanupDownloaderArtifacts, runBilibiliDownloader } from "@/lib/services/video/python-downloader";
import { transcribeByQwen3Asr } from "@/lib/services/asr/qwen3-asr";
import { transcribeChunked } from "@/lib/services/asr/chunked-asr";
import { getRuntimeConfig } from "@/lib/server/runtime-config-store";
import { XiaohongshuParser } from "@/lib/services/video/xiaohongshu-parser";

export interface PlatformParseResult {
  meta: VideoMeta;
  hasNativeSubtitle: boolean;
}

export interface PlatformTranscriptResult {
  meta: VideoMeta;
  subtitleSource: SubtitleSource;
  segments: SubtitleSegment[];
  fullText: string;
}

export interface PlatformParser {
  parse(url: string): Promise<PlatformParseResult>;
  fetchTranscript(url: string): Promise<PlatformTranscriptResult>;
}

const LONG_VIDEO_THRESHOLD_SECONDS = 300;

function joinSegments(segments: SubtitleSegment[]) {
  return segments.map((item) => item.text).join("\n");
}

class BilibiliParser implements PlatformParser {
  async parse(url: string): Promise<PlatformParseResult> {
    const headers = buildBilibiliHeaders();
    const parsed = await fetchBilibiliMeta(url, headers);
    const subtitleResult = await fetchBilibiliNativeSubtitles({
      bvid: parsed.bvid,
      cid: parsed.cid,
      headers
    });
    return {
      meta: parsed.meta,
      hasNativeSubtitle: subtitleResult.hasNativeSubtitle
    };
  }

  async fetchTranscript(url: string): Promise<PlatformTranscriptResult> {
    const headers = buildBilibiliHeaders();
    const parsed = await fetchBilibiliMeta(url, headers);
    const native = await fetchBilibiliNativeSubtitles({
      bvid: parsed.bvid,
      cid: parsed.cid,
      headers
    });
    if (native.hasNativeSubtitle && native.segments.length > 0) {
      return {
        meta: parsed.meta,
        subtitleSource: "native",
        segments: native.segments,
        fullText: joinSegments(native.segments)
      };
    }

    const config = getRuntimeConfig();
    const downloaded = await runBilibiliDownloader({
      url,
      userAgent: config.bilibiliUserAgent,
      cookie: config.bilibiliCookie
    });

    const shouldChunk = parsed.meta.duration > LONG_VIDEO_THRESHOLD_SECONDS;

    try {
      let asrResult;
      if (shouldChunk) {
        asrResult = await transcribeChunked(downloaded.audioPath, {
          onLog: (message) => console.log(message),
          maxAttempts: 2
        });
      } else {
        asrResult = await transcribeByQwen3Asr(downloaded.audioPath);
      }

      return {
        meta: parsed.meta,
        subtitleSource: "asr",
        segments: asrResult.segments,
        fullText: asrResult.fullText
      };
    } finally {
      await cleanupDownloaderArtifacts(downloaded.workDir);
    }
  }
}

const bilibiliParser = new BilibiliParser();
const xiaohongshuParser = new XiaohongshuParser();

export function detectPlatform(url: string) {
  if (url.includes("bilibili.com") || url.includes("b23.tv")) {
    return "bilibili";
  }
  if (url.includes("xiaohongshu.com") || url.includes("xhslink.com")) {
    return "xiaohongshu";
  }
  return null;
}

export function getPlatformParser(url: string): PlatformParser {
  const platform = detectPlatform(url);
  if (platform === "bilibili") {
    return bilibiliParser;
  }
  if (platform === "xiaohongshu") {
    return xiaohongshuParser;
  }
  throw new Error("当前链接平台暂不支持");
}
