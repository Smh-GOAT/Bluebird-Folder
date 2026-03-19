import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createFolder,
  getFolderCounts,
  listFolders
} from "@/lib/server/prisma-store";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { code: 40101, data: null, message: "未登录" },
        { status: 401 }
      );
    }

    const folders = await listFolders(user.id);
    const counts = await getFolderCounts(user.id);

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
  } catch (error) {
    return NextResponse.json(
      {
        code: 50001,
        data: null,
        message: error instanceof Error ? error.message : "获取文件夹失败"
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

    const body = (await request.json()) as { name?: string };
    const folder = await createFolder(user.id, body.name ?? "");
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
