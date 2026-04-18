import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const cookieToken = request.cookies.get('id_token')?.value;
  const token = authHeader || (cookieToken ? `Bearer ${cookieToken}` : '');

  const headerOrgId = request.headers.get('X-Org-ID');

  const orgId = headerOrgId;

  const body = await request.json();

  const backendUrl = process.env.BACKEND_URL_CORE || 'http://localhost:3003/api/v1/core';

  try {
    const response = await fetch(`${backendUrl}/products`, {
      method: 'POST',
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json',
        ...(orgId ? { 'X-Org-ID': orgId } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[BFF Product Create Proxy] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
