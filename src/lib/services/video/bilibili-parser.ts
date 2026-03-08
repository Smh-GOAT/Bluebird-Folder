import type { VideoMeta } from "@/types";
import { requestJson } from "@/lib/services/common/http-client";

interface BilibiliPageItem {
  cid: number;
  page: number;
  part: string;
  duration: number;
}

interface BilibiliViewApiResponse {
  code: number;
  message: string;
  data?: {
    bvid: string;
    aid: number;
    title: string;
    owner: { name: string };
    duration: number;
    pubdate: number;
    stat?: {
      view?: number;
      like?: number;
    };
    pages?: BilibiliPageItem[];
  };
}

const BVID_REGEX = /BV([A-Za-z0-9]{10})/;
const AID_REGEX = /(?:\/av|aid=)(\d+)/;

export type BilibiliIdentity =
  | { type: "bvid"; value: string }
  | { type: "aid"; value: string };

export function parseBilibiliIdentity(inputUrl: string): BilibiliIdentity {
  const normalized = decodeURIComponent(inputUrl.trim());
  const bvidMatch = normalized.match(BVID_REGEX);
  if (bvidMatch) {
    return { type: "bvid", value: `BV${bvidMatch[1]}` };
  }

  const aidMatch = normalized.match(AID_REGEX);
  if (aidMatch) {
    return { type: "aid", value: aidMatch[1] };
  }

  throw new Error("无法从链接中解析 Bilibili 视频 ID");
}

async function resolveShortLinkIfNeeded(inputUrl: string) {
  if (!inputUrl.includes("b23.tv")) {
    return inputUrl;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6_000);
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

function buildViewApiUrl(identity: BilibiliIdentity) {
  if (identity.type === "bvid") {
    return `https://api.bilibili.com/x/web-interface/view?bvid=${identity.value}`;
  }
  return `https://api.bilibili.com/x/web-interface/view?aid=${identity.value}`;
}

export interface BilibiliParsedResult {
  meta: VideoMeta;
  bvid: string;
  aid: number;
  cid: number;
}

export async function fetchBilibiliMeta(url: string, headers: Record<string, string>) {
  const resolvedUrl = await resolveShortLinkIfNeeded(url);
  const identity = parseBilibiliIdentity(resolvedUrl);
  const apiUrl = buildViewApiUrl(identity);

  const result = await requestJson<BilibiliViewApiResponse>(apiUrl, {
    headers,
    timeoutMs: 10_000,
    retries: 1
  });
  if (result.code !== 0 || !result.data) {
    throw new Error(result.message || "Bilibili 元信息接口返回异常");
  }

  const firstPage = result.data.pages?.[0];
  if (!firstPage) {
    throw new Error("视频分页信息缺失");
  }

  const meta: VideoMeta = {
    platform: "bilibili",
    videoId: result.data.bvid,
    title: result.data.title,
    author: result.data.owner.name,
    duration: result.data.duration,
    publishAt: new Date(result.data.pubdate * 1000).toISOString(),
    viewCount: result.data.stat?.view,
    likeCount: result.data.stat?.like,
    pages: (result.data.pages || []).map((page) => ({
      cid: page.cid,
      title: page.part,
      duration: page.duration,
      page: page.page
    }))
  };

  return {
    meta,
    bvid: result.data.bvid,
    aid: result.data.aid,
    cid: firstPage.cid
  } satisfies BilibiliParsedResult;
}
