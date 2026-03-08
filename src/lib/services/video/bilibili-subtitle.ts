import type { SubtitleSegment } from "@/types";
import { requestJson } from "@/lib/services/common/http-client";

interface SubtitleItem {
  id: number;
  lan: string;
  lan_doc: string;
  subtitle_url: string;
}

interface PlayerResponse {
  code: number;
  message: string;
  data?: {
    subtitle?: {
      subtitles?: SubtitleItem[];
    };
  };
}

interface SubtitleBodyResponse {
  body: Array<{
    from: number;
    to: number;
    content: string;
  }>;
}

function normalizeSubtitleUrl(url: string) {
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  return url;
}

export async function fetchBilibiliNativeSubtitles(input: {
  bvid: string;
  cid: number;
  headers: Record<string, string>;
}) {
  const playerApi = `https://api.bilibili.com/x/player/v2?bvid=${input.bvid}&cid=${input.cid}`;
  const playerResult = await requestJson<PlayerResponse>(playerApi, {
    headers: input.headers,
    timeoutMs: 8_000,
    retries: 1
  });

  if (playerResult.code !== 0) {
    throw new Error(playerResult.message || "获取字幕索引失败");
  }

  const subtitles = playerResult.data?.subtitle?.subtitles || [];
  if (!subtitles.length) {
    return {
      hasNativeSubtitle: false,
      segments: [] as SubtitleSegment[]
    };
  }

  const picked = subtitles[0];
  const subtitleUrl = normalizeSubtitleUrl(picked.subtitle_url);
  const subtitleBody = await requestJson<SubtitleBodyResponse>(subtitleUrl, {
    headers: input.headers,
    timeoutMs: 8_000,
    retries: 1
  });

  const segments: SubtitleSegment[] = subtitleBody.body.map((line) => ({
    start: Number(line.from.toFixed(3)),
    end: Number(line.to.toFixed(3)),
    text: line.content.trim()
  }));

  return {
    hasNativeSubtitle: segments.length > 0,
    segments
  };
}
