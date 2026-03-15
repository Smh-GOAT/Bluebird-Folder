import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/server/qa-store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = getSession(id);

    if (!session) {
      return NextResponse.json(
        { code: 404, message: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 0,
      data: {
        sessionId: session.id,
        historyId: session.historyId,
        messages: session.messages,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    console.error("[qa-session] error:", error);
    return NextResponse.json(
      {
        code: 500,
        message: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}
