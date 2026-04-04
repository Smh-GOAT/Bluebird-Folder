import { NextRequest } from "next/server";
import { proxyGet, proxyPost } from "@/lib/forsion/proxy";

export async function GET(request: NextRequest) {
  return proxyGet(request, "/api/bluebird/folders");
}

export async function POST(request: NextRequest) {
  return proxyPost(request, "/api/bluebird/folders");
}
