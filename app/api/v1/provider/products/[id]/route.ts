import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('Authorization');
  const orgId = request.headers.get('X-Org-ID');
  const body = await request.json();
  const { id } = params;
  
  const backendUrl = process.env.BACKEND_URL_PROVIDER || 'http://localhost:3003/api/v1/provider';

  try {
    const response = await fetch(`${backendUrl}/products/${id}`, {
      method: 'PUT',
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
    console.error(`[BFF Product Update Proxy] Error for ID ${id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('Authorization');
  const orgId = request.headers.get('X-Org-ID');
  const { id } = params;
  
  const backendUrl = process.env.BACKEND_URL_PROVIDER || 'http://localhost:3003/api/v1/provider';

  try {
    const response = await fetch(`${backendUrl}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader || '',
        ...(orgId ? { 'X-Org-ID': orgId } : {}),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[BFF Product Delete Proxy] Error for ID ${id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
