import { NextRequest, NextResponse } from "next/server";
import { getHistoryById } from "@/lib/server/sidebar-store";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const history = getHistoryById(id);
    if (!history) {
      return NextResponse.json(
        {
          code: 40401,
          data: null,
          message: "历史记录不存在"
        },
        { status: 404 }
      );
    }
    return NextResponse.json({
      code: 0,
      data: history,
      message: "success"
    });
  } catch (error) {
    return NextResponse.json(
      {
        code: 50001,
        data: null,
        message: error instanceof Error ? error.message : "读取历史记录失败"
      },
      { status: 500 }
    );
  }
}
