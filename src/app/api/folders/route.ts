import { NextRequest, NextResponse } from "next/server";
import { createFolder, getFolderCounts, listFolders } from "@/lib/server/sidebar-store";

export async function GET() {
  const folders = listFolders();
  const counts = getFolderCounts();

  return NextResponse.json({
    code: 0,
    data: {
      folders: folders.map((folder) => ({
        ...folder,
        count: counts.folders[folder.id] ?? 0
      })),
      total: counts.total,
      unassigned: counts.unassigned
    },
    message: "success"
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { name?: string };
    const folder = createFolder(body.name ?? "");
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
        message: error instanceof Error ? error.message : "创建失败"
      },
      { status: 400 }
    );
  }
}
