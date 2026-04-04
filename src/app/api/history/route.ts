import { NextRequest } from "next/server";
import { proxyGet, proxyPost } from "@/lib/forsion/proxy";

export async function GET(request: NextRequest) {
  const folderId = request.nextUrl.searchParams.get("folderId");
  const path = folderId
    ? `/api/bluebird/histories?folderId=${encodeURIComponent(folderId)}`
    : "/api/bluebird/histories";
  return proxyGet(request, path);
}

export async function POST(request: NextRequest) {
  return proxyPost(request, "/api/bluebird/histories");
}
