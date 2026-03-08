import { z } from "zod";
import { ErrorCodes } from "@/lib/services/common/error-codes";
import { errorResponse, successResponse } from "@/lib/services/common/api-response";
import { fetchBilibiliMeta } from "@/lib/services/video/bilibili-parser";
import { fetchBilibiliNativeSubtitles } from "@/lib/services/video/bilibili-subtitle";
import { buildBilibiliHeaders } from "@/lib/services/video/request-headers";

const schema = z.object({
  url: z.string().url()
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    if (!body.url.includes("bilibili.com") && !body.url.includes("b23.tv")) {
      return errorResponse(ErrorCodes.UNSUPPORTED_PLATFORM, "Milestone 1 当前仅支持 Bilibili 链接");
    }

    const headers = buildBilibiliHeaders();
    const parsed = await fetchBilibiliMeta(body.url, headers);
    const subtitleResult = await fetchBilibiliNativeSubtitles({
      bvid: parsed.bvid,
      cid: parsed.cid,
      headers
    });

    return successResponse({
      meta: parsed.meta,
      hasNativeSubtitle: subtitleResult.hasNativeSubtitle
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.INVALID_URL, "请提供合法的视频链接");
    }
    return errorResponse(
      ErrorCodes.VIDEO_PARSE_FAILED,
      error instanceof Error ? error.message : "视频解析失败",
      500
    );
  }
}
