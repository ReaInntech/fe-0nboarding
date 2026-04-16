import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('Authorization');
  const orgId = request.headers.get('X-Org-ID');
  const body = await request.json();
  const { id } = params;
  
  const backendUrl = process.env.BACKEND_URL_CORE || 'http://localhost:3001/api/v1/core';

  try {
    const response = await fetch(`${backendUrl}/notifications/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
        ...(orgId ? { 'X-Org-ID': orgId } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[BFF Notification Proxy] Error for ID ${id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
