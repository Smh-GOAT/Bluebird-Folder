import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addMessage } from "@/lib/server/prisma-qa-store";
import type { QAMessage } from "@/types/qa";

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

    const body = await request.json() as {
      sessionId: string;
      role: "user" | "assistant";
      content: string;
      model?: string;
      references?: Array<{ start: number; end: number; text: string; score: number }>;
    };

    if (!body.sessionId || !body.role || !body.content) {
      return NextResponse.json(
        { code: 40001, data: null, message: "缺少必要字段" },
        { status: 400 }
      );
    }

    const messageData: Omit<QAMessage, "id"> = {
      role: body.role,
      content: body.content,
      timestamp: new Date().toISOString(),
      model: body.model,
      references: body.references
    };

    const message = await addMessage(user.id, body.sessionId, messageData);

    return NextResponse.json({
      code: 0,
      data: message,
      message: "success"
    });
  } catch (error) {
    return NextResponse.json(
      {
        code: 50001,
        data: null,
        message: error instanceof Error ? error.message : "发送消息失败"
      },
      { status: 500 }
    );
  }
}
