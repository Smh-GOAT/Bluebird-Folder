import { z } from "zod";
import { ErrorCodes } from "@/lib/services/common/error-codes";
import { errorResponse, successResponse } from "@/lib/services/common/api-response";
import { detectPlatform, getPlatformParser } from "@/lib/services/video/platform-parser";

const schema = z.object({
  url: z.string().url()
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const platform = detectPlatform(body.url);
    if (!platform) {
      return errorResponse(ErrorCodes.UNSUPPORTED_PLATFORM, "当前仅支持 Bilibili / 小红书 链接");
    }
    const parser = getPlatformParser(body.url);
    const parsed = await parser.parse(body.url);

    return successResponse({
      meta: parsed.meta,
      hasNativeSubtitle: parsed.hasNativeSubtitle
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
