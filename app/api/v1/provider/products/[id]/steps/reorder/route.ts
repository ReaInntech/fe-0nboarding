import { NextRequest } from 'next/server';
import { proxyManager } from '../../../../../../../../src/lib/bff/ProxyManager';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;
  return proxyManager.handleRequest(request, 'provider', `products/${productId}/steps/reorder`);
}
