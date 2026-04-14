/**
 * Standardized API Client Configuration
 * Handles multiple microservices and automatic header injection (Auth & Org ID)
 */

const getBaseUrl = (microservice: 'core' | 'payments' | 'provider') => {
  switch (microservice) {
    case 'payments': return process.env.NEXT_PUBLIC_BACKEND_URL_PAYMENTS || 'http://localhost:3001/api/v1/payments';
    case 'provider': return process.env.NEXT_PUBLIC_BACKEND_URL_PROVIDER || 'http://localhost:3001/api/v1/provider';
    default: return process.env.NEXT_PUBLIC_BACKEND_URL_CORE || 'http://localhost:3001/api/v1/core';
  }
};

interface ApiOptions extends RequestInit {
  microservice?: 'core' | 'payments' | 'provider';
  token?: string;
  orgId?: string;
}

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
  const { microservice = 'core', token, orgId, ...fetchOptions } = options;
  const baseUrl = getBaseUrl(microservice);
  
  const headers = new Headers(fetchOptions.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (orgId) {
    headers.set('X-Org-ID', orgId);
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
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
