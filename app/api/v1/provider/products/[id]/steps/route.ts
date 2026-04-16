import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('Authorization');
  const orgId = request.headers.get('X-Org-ID');
  const body = await request.json();
  const { id: productId } = params;
  
  const backendUrl = process.env.BACKEND_URL_PROVIDER || 'http://localhost:3003/api/v1/provider';

  try {
    const response = await fetch(`${backendUrl}/products/${productId}/steps`, {
      method: 'POST',
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
    console.error(`[BFF Product Step Create Proxy] Error for product ${productId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
