import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSession, getSession, deleteSession } from "@/lib/server/prisma-qa-store";

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

    const body = await request.json() as { historyId: string; title?: string };
    
    if (!body.historyId) {
      return NextResponse.json(
        { code: 40001, data: null, message: "缺少 historyId" },
        { status: 400 }
      );
    }

    const session = await createSession(user.id, body.historyId, body.title);

    return NextResponse.json({
      code: 0,
      data: session,
      message: "success"
    });
  } catch (error) {
    return NextResponse.json(
      {
        code: 50001,
        data: null,
        message: error instanceof Error ? error.message : "创建会话失败"
      },
      { status: 500 }
    );
  }
}
