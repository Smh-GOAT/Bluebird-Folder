import { NextRequest } from "next/server";
import { proxyPatch, proxyDelete } from "@/lib/forsion/proxy";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyPatch(request, `/api/bluebird/folders/${id}`);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyDelete(request, `/api/bluebird/folders/${id}`);
}
