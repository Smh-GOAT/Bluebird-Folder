import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listHistories, saveHistory } from "@/lib/server/prisma-store";
import type { VideoHistoryItem } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { code: 40101, data: null, message: "未登录" },
        { status: 401 }
      );
    }

    const folderId = request.nextUrl.searchParams.get("folderId") ?? undefined;
    const histories = await listHistories(user.id, folderId);
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { code: 40101, data: null, message: "未登录" },
        { status: 401 }
      );
    }

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
    const saved = await saveHistory(user.id, body as VideoHistoryItem);
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
