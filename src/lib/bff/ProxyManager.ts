import { NextRequest, NextResponse } from 'next/server';
import { BffStrategy, BffRequestMetadata } from './types';
import { DefaultForwardingStrategy } from './strategies/DefaultForwardingStrategy';

export class ProxyManager {
  private strategies: BffStrategy[] = [];

  constructor() {
    // Basic strategies would be added here
    this.strategies.push(new DefaultForwardingStrategy());
  }

  async handleRequest(request: NextRequest, microservice: string, path: string): Promise<NextResponse> {
    const context = request.headers.get('X-BFF-Context') || undefined;
    const orgId = request.headers.get('X-Org-ID') || undefined;

    const metadata: BffRequestMetadata = {
      microservice,
      path,
      context,
      orgId
    };

    // 1. Selector logic - Find the best strategy
    const strategy = this.strategies.find(s => s.shouldProcess(request, metadata)) || this.strategies[0];

    // 2. Build target URL
    const targetBaseUrl = this.getTargetBaseUrl(microservice);
    const targetUrl = `${targetBaseUrl}/${path}${request.nextUrl.search || ''}`;

    // 3. Authorization Hook
    if (strategy.authorize) {
      await strategy.authorize(request, metadata);
    }

    // 4. Execution
    return strategy.execute(request, targetUrl, metadata);
  }

  private getTargetBaseUrl(microservice: string): string {
    switch (microservice) {
      case 'payments': return process.env.BACKEND_URL_PAYMENTS || 'http://localhost:3002/api/v1/payments';
      case 'provider': return process.env.BACKEND_URL_PROVIDER || 'http://localhost:3003/api/v1/provider';
      default: return process.env.BACKEND_URL_CORE || 'http://localhost:3001/api/v1/core';
    }
  }
}

// Export singleton
export const proxyManager = new ProxyManager();
