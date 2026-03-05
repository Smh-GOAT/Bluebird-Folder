import { NextRequest, NextResponse } from "next/server";
import { listHistories } from "@/lib/server/sidebar-store";

export async function GET(request: NextRequest) {
  const folderId = request.nextUrl.searchParams.get("folderId") ?? undefined;
  const histories = listHistories(folderId);
  return NextResponse.json({
    code: 0,
    data: {
      items: histories
    },
    message: "success"
  });
}
