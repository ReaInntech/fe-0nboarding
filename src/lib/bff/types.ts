import { NextRequest, NextResponse } from 'next/server';

export interface BffRequestMetadata {
  microservice: string;
  path: string;
  context?: string;
  orgId?: string;
}

export interface BffStrategy {
  name: string;
  
  /**
   * Determines if this strategy should be applied to the current request.
   */
  shouldProcess(request: NextRequest, metadata: BffRequestMetadata): boolean;

  /**
   * Pre-execution hook for authorization or validation.
   * Throws an error (e.g. UnauthorizedException) if validation fails.
   */
  authorize?(request: NextRequest, metadata: BffRequestMetadata): Promise<void>;

  /**
   * Post-execution hook for reporting or logging.
   */
  report?(request: NextRequest, response: Response, metadata: BffRequestMetadata): Promise<void>;

  /**
   * The actual forwarding logic.
   */
  execute(request: NextRequest, targetUrl: string, metadata: BffRequestMetadata): Promise<NextResponse>;
}
