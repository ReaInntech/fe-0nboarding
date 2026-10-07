import { NextRequest } from "next/server";
import { proxyManager } from "../../../../../../src/lib/bff/ProxyManager";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyManager.handleRequest(request, "core", `notifications/${id}`);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyManager.handleRequest(request, "core", `notifications/${id}`);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyManager.handleRequest(request, "core", `notifications/${id}`);
}
