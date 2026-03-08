import { NextRequest, NextResponse } from "next/server";
import { listHistories } from "@/lib/server/sidebar-store";

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
