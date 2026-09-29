import { NextRequest } from 'next/server';
import { proxyManager } from '../../../../../src/lib/bff/ProxyManager';

export async function POST(request: NextRequest) {
  return proxyManager.handleRequest(request, 'provider', 'products');
}
