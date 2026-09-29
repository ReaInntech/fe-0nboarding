import { NextRequest } from 'next/server';
import { proxyManager } from '../../../../../src/lib/bff/ProxyManager';

export async function GET(request: NextRequest) {
  return proxyManager.handleRequest(request, 'core', 'notifications');
}
