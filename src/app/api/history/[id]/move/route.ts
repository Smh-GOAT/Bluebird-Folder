import { NextRequest } from "next/server";
import { proxyPatch } from "@/lib/forsion/proxy";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyPatch(request, `/api/bluebird/histories/${id}/move`);
}
