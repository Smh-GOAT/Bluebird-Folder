import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/forsion/proxy";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return proxyGet(request, `/api/bluebird/qa/sessions/${id}`);
}
