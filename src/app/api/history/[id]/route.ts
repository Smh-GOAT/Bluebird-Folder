import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/forsion/proxy";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyGet(request, `/api/bluebird/histories/${id}`);
}
