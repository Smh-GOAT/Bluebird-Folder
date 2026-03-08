import { z } from "zod";
import { ErrorCodes } from "@/lib/services/common/error-codes";
import { errorResponse, successResponse } from "@/lib/services/common/api-response";
import { fetchBilibiliMeta } from "@/lib/services/video/bilibili-parser";
import { fetchBilibiliNativeSubtitles } from "@/lib/services/video/bilibili-subtitle";
import { runBilibiliDownloader } from "@/lib/services/video/python-downloader";
import { buildBilibiliHeaders } from "@/lib/services/video/request-headers";
import { transcribeByQwen3Asr } from "@/lib/services/asr/qwen3-asr";
import { getRuntimeConfig } from "@/lib/server/runtime-config-store";

const schema = z.object({
  url: z.string().url()
});

function joinSegments(segments: Array<{ text: string }>) {
  return segments.map((item) => item.text).join("\n");
}

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    if (!body.url.includes("bilibili.com") && !body.url.includes("b23.tv")) {
      return errorResponse(ErrorCodes.UNSUPPORTED_PLATFORM, "Milestone 1 当前仅支持 Bilibili 链接");
    }

    const headers = buildBilibiliHeaders();
    const parsed = await fetchBilibiliMeta(body.url, headers);

    const native = await fetchBilibiliNativeSubtitles({
      bvid: parsed.bvid,
      cid: parsed.cid,
      headers
    });
    if (native.hasNativeSubtitle && native.segments.length > 0) {
      return successResponse({
        meta: parsed.meta,
        subtitleSource: "native" as const,
        segments: native.segments,
        fullText: joinSegments(native.segments)
      });
    }

    const config = getRuntimeConfig();
    const downloaded = await runBilibiliDownloader({
      url: body.url,
      userAgent: config.bilibiliUserAgent,
      cookie: config.bilibiliCookie
    });
    const asrResult = await transcribeByQwen3Asr(downloaded.audioPath);

    return successResponse({
      meta: parsed.meta,
      subtitleSource: "asr" as const,
      segments: asrResult.segments,
      fullText: asrResult.fullText
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.INVALID_URL, "请提供合法的视频链接");
    }
    return errorResponse(
      ErrorCodes.SUBTITLE_FETCH_FAILED,
      error instanceof Error ? error.message : "字幕获取失败",
      500
    );
  }
}
