import { NextRequest, NextResponse } from "next/server";
import { deleteFolder, renameFolder } from "@/lib/server/sidebar-store";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { name?: string };
    const folder = renameFolder(id, body.name ?? "");
    return NextResponse.json({
      code: 0,
      data: folder,
      message: "success"
    });
  } catch (error) {
    return NextResponse.json(
      {
        code: 40001,
        data: null,
        message: error instanceof Error ? error.message : "更新失败"
      },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    deleteFolder(id);
    return NextResponse.json({
      code: 0,
      data: null,
      message: "success"
    });
  } catch (error) {
    return NextResponse.json(
      {
        code: 40001,
        data: null,
        message: error instanceof Error ? error.message : "删除失败"
      },
      { status: 400 }
    );
  }
}
