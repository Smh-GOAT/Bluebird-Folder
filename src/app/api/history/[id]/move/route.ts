import { NextRequest, NextResponse } from "next/server";
import { moveHistoryToFolder } from "@/lib/server/sidebar-store";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { folderId?: string | null };
    const history = moveHistoryToFolder(id, body.folderId ?? null);
    return NextResponse.json({
      code: 0,
      data: history,
      message: "success"
    });
  } catch (error) {
    return NextResponse.json(
      {
        code: 40001,
        data: null,
        message: error instanceof Error ? error.message : "移动失败"
      },
      { status: 400 }
    );
  }
}
