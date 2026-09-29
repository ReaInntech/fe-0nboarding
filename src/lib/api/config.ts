/**
 * Standardized API Client Configuration
 * Handles multiple microservices and automatic header injection (Auth & Org ID)
 */

const getBaseUrl = (microservice: 'core' | 'payments' | 'provider') => {
  // If we are on the server, we use direct microservice URLs
  if (typeof window === 'undefined') {
    switch (microservice) {
      case 'payments': return process.env.BACKEND_URL_PAYMENTS || 'http://localhost:3002/api/v1/payments';
      case 'provider': return process.env.BACKEND_URL_PROVIDER || 'http://localhost:3003/api/v1/provider';
      default: return process.env.BACKEND_URL_CORE || 'http://localhost:3001/api/v1/core';
    }
  }

  // If we are on the client, we route through our Next.js BFF API
  // Pattern: /api/v1/{microservice}
  return `/api/v1/${microservice}`;
};

interface ApiOptions extends RequestInit {
  microservice?: 'core' | 'payments' | 'provider';
  token?: string;
  orgId?: string;
  context?: string; // Format: modulo:page:service
}

// Global listener for 401 Unauthorized errors
type UnauthorizedListener = () => void;
let unauthorizedListener: UnauthorizedListener | null = null;

export const setUnauthorizedListener = (listener: UnauthorizedListener) => {
  unauthorizedListener = listener;
};

export type MockStrategy = 'always' | 'fallback' | 'off';

/**
 * Determines the current mocking strategy based on environment variables.
 * - Always: Forces mock data for UI-only development.
 * - Fallback: Use mocks only if the API call fails (default in dev).
 * - Off: Never use mocks (default in production).
 */
export function getMockStrategy(): MockStrategy {
  const strategy = process.env.NEXT_PUBLIC_MOCK_STRATEGY as MockStrategy;
  if (strategy) return strategy;
  
  return process.env.NODE_ENV === 'production' ? 'off' : 'fallback';
}

/**
 * Standardized Fetching Wrapper
 */
export async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { microservice = 'core', token: explicitToken, orgId, context, ...fetchOptions } = options;
  const baseUrl = getBaseUrl(microservice);
  
  const headers = new Headers(fetchOptions.headers);
  let token = explicitToken;

  // Auto-inject client Firebase token if not provided explicitly
  if (!token && typeof window !== 'undefined') {
    try {
      const { auth } = await import('../firebase/config');
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken().catch(() => undefined);
      }
    } catch {
      // Firebase auth not initialized or ready
    }
  }
  
  if (token) {
    console.debug(`[apiFetch] Injecting Authorization header for ${endpoint} | Token present: true`);
    headers.set('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
  } else {
    console.warn(`[apiFetch] No token provided for ${endpoint}`);
  }
  
  if (orgId) {
    headers.set('X-Org-ID', orgId);
  }

  if (context) {
    headers.set('X-BFF-Context', context);
  }

  let response = await fetch(`${baseUrl}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  // If 401 on client and we have an active Firebase user, try a forced token refresh once
  if (response.status === 401 && typeof window !== 'undefined') {
    try {
      const { auth } = await import('../firebase/config');
      if (auth.currentUser) {
        const freshToken = await auth.currentUser.getIdToken(true).catch(() => null);
        if (freshToken && freshToken !== token) {
          token = freshToken;
          headers.set('Authorization', `Bearer ${freshToken}`);
          response = await fetch(`${baseUrl}${endpoint}`, {
            ...fetchOptions,
            headers,
          });
        }
      }
    } catch {
      // Refresh attempt failed
    }
  }

  if (response.status === 401) {
    console.warn(`[API] Unauthorized (401) detected for ${endpoint}`);
    // Only notify listener if this was an authenticated request that failed after refresh attempt
    if (token && unauthorizedListener) {
      unauthorizedListener();
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `API Error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result.data !== undefined ? result.data : result;
}

/**
 * Executes an API call with configurable fallback logic.
 * Respects the global NEXT_PUBLIC_MOCK_STRATEGY.
 */
export async function executeWithFallback<T>(apiCall: () => Promise<T>, fallbackData: T): Promise<T> {
  const strategy = getMockStrategy();

  if (strategy === 'always') {
    console.debug('[Mock] Strategy is "always". Returning fallback data.');
    return fallbackData;
  }

  try {
    return await apiCall();
  } catch (error) {
    if (strategy === 'fallback') {
      console.warn('[Mock] API call failed. Strategy is "fallback". Returning mock data.', error);
      return fallbackData;
    }
    
    console.error('[Mock] API call failed. Strategy is "off". Propagating error.', error);
    throw error;
  }
}
