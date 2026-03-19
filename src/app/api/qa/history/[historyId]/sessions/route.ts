import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listSessionsByHistoryId } from "@/lib/server/prisma-qa-store";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ historyId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { code: 40101, data: null, message: "未登录" },
        { status: 401 }
      );
    }

    const { historyId } = await params;
    const sessions = await listSessionsByHistoryId(user.id, historyId);

    return NextResponse.json({
      code: 0,
      data: { sessions },
      message: "success"
    });
  } catch (error) {
    return NextResponse.json(
      {
        code: 50001,
        data: null,
        message: error instanceof Error ? error.message : "获取会话列表失败"
      },
      { status: 500 }
    );
  }
}
