import { z } from "zod";
import { successResponse, errorResponse } from "@/lib/services/common/api-response";
import { ErrorCodes } from "@/lib/services/common/error-codes";
import { getRuntimeConfig, setRuntimeConfig } from "@/lib/server/runtime-config-store";

const updateSchema = z.object({
  bilibiliCookie: z.string().optional(),
  bilibiliUserAgent: z.string().optional(),
  xiaohongshuCookie: z.string().optional(),
  xiaohongshuUserAgent: z.string().optional()
});

export async function GET() {
  const runtime = getRuntimeConfig();
  return successResponse({
    bilibiliCookie: runtime.bilibiliCookie,
    bilibiliUserAgent: runtime.bilibiliUserAgent,
    xiaohongshuCookie: runtime.xiaohongshuCookie,
    xiaohongshuUserAgent: runtime.xiaohongshuUserAgent
  });
}

export async function POST(request: Request) {
  try {
    const body = updateSchema.parse(await request.json());
    setRuntimeConfig(body);
    const runtime = getRuntimeConfig();
    return successResponse({
      bilibiliCookie: runtime.bilibiliCookie,
      bilibiliUserAgent: runtime.bilibiliUserAgent,
      xiaohongshuCookie: runtime.xiaohongshuCookie,
      xiaohongshuUserAgent: runtime.xiaohongshuUserAgent
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(ErrorCodes.BAD_REQUEST, "设置项格式错误");
    }
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      error instanceof Error ? error.message : "保存运行配置失败",
      500
    );
  }
}
