import { NextRequest } from 'next/server';
import { proxyManager } from '../../../../../src/lib/bff/ProxyManager';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (await params).path.join('/');
  return proxyManager.handleRequest(request, 'provider', path);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (await params).path.join('/');
  return proxyManager.handleRequest(request, 'provider', path);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (await params).path.join('/');
  return proxyManager.handleRequest(request, 'provider', path);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (await params).path.join('/');
  return proxyManager.handleRequest(request, 'provider', path);
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = (await params).path.join('/');
  return proxyManager.handleRequest(request, 'provider', path);
}
