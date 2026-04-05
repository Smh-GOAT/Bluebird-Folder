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

export type OnProgress = (percent: number, label: string) => void;

export interface PlatformParser {
  parse(url: string): Promise<PlatformParseResult>;
  fetchTranscript(url: string, onProgress?: OnProgress): Promise<PlatformTranscriptResult>;
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

  async fetchTranscript(url: string, onProgress?: OnProgress): Promise<PlatformTranscriptResult> {
    onProgress?.(5, "获取视频信息");
    const headers = buildBilibiliHeaders();
    const parsed = await fetchBilibiliMeta(url, headers);

    onProgress?.(10, "检查原生字幕");
    const native = await fetchBilibiliNativeSubtitles({
      bvid: parsed.bvid,
      cid: parsed.cid,
      headers
    });
    if (native.hasNativeSubtitle && native.segments.length > 0) {
      onProgress?.(90, "字幕获取完成");
      return {
        meta: parsed.meta,
        subtitleSource: "native",
        segments: native.segments,
        fullText: joinSegments(native.segments)
      };
    }

    onProgress?.(15, "下载音频");
    const config = getRuntimeConfig();
    const downloaded = await runBilibiliDownloader({
      url,
      userAgent: config.bilibiliUserAgent,
      cookie: config.bilibiliCookie
    });
    onProgress?.(35, "音频下载完成");

    const shouldChunk = parsed.meta.duration > LONG_VIDEO_THRESHOLD_SECONDS;

    try {
      let asrResult;
      if (shouldChunk) {
        asrResult = await transcribeChunked(downloaded.audioPath, {
          onLog: (message) => {
            console.log(message);
            const match = message.match(/处理片段 (\d+)\/(\d+)/);
            if (match) {
              const current = Number(match[1]);
              const total = Number(match[2]);
              const pct = 40 + Math.round((current / total) * 45);
              onProgress?.(pct, `转录片段 ${current}/${total}`);
            }
          },
          maxAttempts: 2,
          totalDurationSeconds: parsed.meta.duration,
        });
      } else {
        onProgress?.(40, "转录音频");
        asrResult = await transcribeByQwen3Asr(downloaded.audioPath, parsed.meta.duration);
      }
      onProgress?.(88, "转录完成");

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
