import { NextRequest, NextResponse } from "next/server";
import { listHistories, saveHistory } from "@/lib/server/sidebar-store";
import type { VideoHistoryItem } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const folderId = request.nextUrl.searchParams.get("folderId") ?? undefined;
    const histories = listHistories(folderId);
    return NextResponse.json({
      code: 0,
      data: {
        items: histories
      },
      message: "success"
    });
  } catch (error) {
    return NextResponse.json(
      {
        code: 50001,
        data: null,
        message: error instanceof Error ? error.message : "获取历史记录失败"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<VideoHistoryItem>;
    if (!body.id || !body.title || !body.platform || !body.createdAt) {
      return NextResponse.json(
        {
          code: 40001,
          data: null,
          message: "缺少必要字段：id/title/platform/createdAt"
        },
        { status: 400 }
      );
    }
    const saved = saveHistory(body as VideoHistoryItem);
    return NextResponse.json({
      code: 0,
      data: saved,
      message: "success"
    });
  } catch (error) {
    return NextResponse.json(
      {
        code: 50001,
        data: null,
        message: error instanceof Error ? error.message : "保存历史记录失败"
      },
      { status: 500 }
    );
  }
}
