import { NextRequest, NextResponse } from 'next/server';
import { BffStrategy, BffRequestMetadata } from '../types';

export class DefaultForwardingStrategy implements BffStrategy {
  name = 'DefaultForwarding';

  shouldProcess(): boolean {
    return true; // Catch-all fallback
  }

  async execute(request: NextRequest, targetUrl: string, metadata: BffRequestMetadata): Promise<NextResponse> {
    const authHeader = request.headers.get('Authorization');
    const cookieToken = request.cookies.get('id_token')?.value;
    const token = authHeader || (cookieToken ? `Bearer ${cookieToken}` : '');

    console.debug(`[BFF Proxy] Forwarding to ${targetUrl} | Token present: ${!!token} | Context: ${metadata.context}`);

    const xOrgId = request.headers.get('X-Org-ID');
    const xBffContext = request.headers.get('X-BFF-Context');

    const headers = new Headers();
    if (token) headers.set('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
    if (xOrgId) headers.set('X-Org-ID', xOrgId);
    if (xBffContext) headers.set('X-BFF-Context', xBffContext);
    headers.set('Content-Type', request.headers.get('Content-Type') || 'application/json');

    try {
      const fetchOptions: RequestInit = {
        method: request.method,
        headers,
      };

      if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        fetchOptions.body = await request.text();
      }

      const response = await fetch(targetUrl, fetchOptions);
      
      // Hook for future reporting
      if (this.report) {
         await this.report(request, response, metadata);
      }

      const data = await response.json().catch(() => ({}));
      return NextResponse.json(data, { status: response.status });

    } catch (error) {
      console.error(`[BFF Proxy Error] ${metadata.microservice}: ${error}`);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  async report(request: NextRequest, response: Response, metadata: BffRequestMetadata): Promise<void> {
    // Placeholder for future reporting logic as requested by user
    // console.log(`[BFF Report] Context: ${metadata.context} | Path: ${metadata.path} | Status: ${response.status}`);
  }
}
