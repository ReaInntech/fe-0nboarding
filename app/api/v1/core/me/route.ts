import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const orgId = request.headers.get('X-Org-ID');
  
  const backendUrl = process.env.BACKEND_URL_CORE || 'http://localhost:3001/api/v1/core';

  try {
    const response = await fetch(`${backendUrl}/me`, {
      headers: {
        'Authorization': authHeader || '',
        ...(orgId ? { 'X-Org-ID': orgId } : {}),
      },
      // Ensure we don't cache this on the BFF level
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[BFF Profile Proxy] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
