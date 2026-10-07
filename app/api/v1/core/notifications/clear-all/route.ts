import { NextRequest } from "next/server";
import { proxyManager } from "../../../../../../src/lib/bff/ProxyManager";

export async function DELETE(request: NextRequest) {
  return proxyManager.handleRequest(request, "core", "notifications/clear-all");
}
