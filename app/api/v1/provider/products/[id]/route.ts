import { NextRequest } from 'next/server';
import { proxyManager } from '../../../../../../src/lib/bff/ProxyManager';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyManager.handleRequest(request, 'provider', `products/${id}`);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyManager.handleRequest(request, 'provider', `products/${id}`);
}
