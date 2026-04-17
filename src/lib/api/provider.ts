import { apiFetch, executeWithFallback } from './config';
import { 
  Subscription, 
  SubscriptionDTO, 
  FinanceKpis, 
  FinanceKpiDTO, 
  RevenueDataPoint, 
  RevenuePointDTO,
  CreateProductDTO,
  UpdateProductDTO,
  CreateContractingStepDTO,
  ReorderStepsDTO
} from './types';
import { 
  FALLBACK_PROVIDER_DASHBOARD_DATA, 
  FALLBACK_PROVIDER_FINANCE_DATA, 
  FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA,
  FALLBACK_PROVIDER_PRODUCTS_DATA
} from './mocks';
import { mapSubscription } from './dashboard';

export function mapFinanceKpis(dto: FinanceKpiDTO): FinanceKpis {
  return {
    totalRevenue: dto.total_revenue_ytd,
    pendingPayout: dto.pending_payout,
    activeClients: dto.active_clients_count,
    successRate: dto.payment_success_rate,
    growth: dto.revenue_growth_pct,
  };
}

export function mapRevenuePoint(dto: RevenuePointDTO): RevenueDataPoint {
  return {
    month: dto.period,
    revenue: dto.amount,
    label: dto.period,
    value: dto.amount,
  };
}

export async function getProviderStats(token: string, orgId: string) {
  return apiFetch('/dashboard/stats', { 
    microservice: 'provider',
    token, 
    orgId 
  });
}

export async function getProviderSubscriptions(token: string, orgId: string): Promise<Subscription[]> {
  const data = await apiFetch<SubscriptionDTO[]>('/dashboard/subscriptions', { 
    microservice: 'provider',
    token, 
    orgId 
  });
  return (data || []).map(mapSubscription);
}

export async function getFinanceKPIs(token: string, orgId: string): Promise<FinanceKpis> {
  const data = await apiFetch<FinanceKpiDTO>('/finance/kpis', { 
    microservice: 'provider',
    token, 
    orgId 
  });
  return mapFinanceKpis(data);
}

export async function getRevenueHistory(token: string, orgId: string): Promise<RevenueDataPoint[]> {
  const data = await apiFetch<RevenuePointDTO[]>('/finance/revenue-history', { 
    microservice: 'provider',
    token, 
    orgId 
  });
  return (data || []).map(mapRevenuePoint);
}

export async function getProviderProducts(token: string, orgId: string) {
  return apiFetch('/products', { 
    microservice: 'provider',
    token, 
    orgId 
  });
}

/**
 * BFF Aggregator for Provider Products List
 */
export async function getProviderProductsInit(token: string, orgId: string) {
  return executeWithFallback(async () => {
    const data = await getProviderProducts(token, orgId);
    return {
      products: Array.isArray(data) ? data : (data as any).products || []
    };
  }, FALLBACK_PROVIDER_PRODUCTS_DATA);
}

export async function getProviderProductDetailData(id: string, token?: string, orgId?: string) {
  return executeWithFallback(async () => {
    // Currently mapping is handled by providing the FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA 
    // until real endpoints are fully wired.
    throw new Error('Not implemented');
  }, FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA);
}

/**
 * Create a new product (Core API)
 */
export async function createProduct(token?: string, orgId?: string, dto?: CreateProductDTO) {
  return apiFetch('/products', {
    method: 'POST',
    microservice: 'provider',
    token,
    orgId,
    body: JSON.stringify(dto),
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Update a product (Core API)
 */
export async function updateProduct(id: string, token: string, orgId: string, dto: UpdateProductDTO) {
  return apiFetch(`/products/${id}`, {
    method: 'PUT',
    token,
    orgId,
    body: JSON.stringify(dto),
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Add a step to a product (Core API)
 */
export async function createProductStep(productId: string, token: string, orgId: string, dto: CreateContractingStepDTO) {
  return apiFetch(`/products/${productId}/steps`, {
    method: 'POST',
    token,
    orgId,
    body: JSON.stringify(dto),
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Reorder steps for a product (Core API)
 */
export async function reorderProductSteps(productId: string, token: string, orgId: string, dto: ReorderStepsDTO) {
  return apiFetch(`/products/${productId}/steps/reorder`, {
    method: 'PATCH',
    token,
    orgId,
    body: JSON.stringify(dto),
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * BFF Aggregator for Provider Dashboard Initial State
 */
export async function getProviderDashboardInit(token: string, orgId: string) {
  return executeWithFallback(async () => {
    const [subscriptions, stats] = await Promise.all([
      getProviderSubscriptions(token, orgId),
      getProviderStats(token, orgId),
    ]);

    return {
      subscriptions,
      stats,
    };
  }, FALLBACK_PROVIDER_DASHBOARD_DATA);
}

/**
 * BFF Aggregator for Provider Finance Initial State
 */
export async function getProviderFinanceInit(token: string, orgId: string) {
  return executeWithFallback(async () => {
    const [kpis, revenueHistory] = await Promise.all([
      getFinanceKPIs(token, orgId),
      getRevenueHistory(token, orgId),
    ]);

    return {
      kpis,
      revenueHistory,
    };
  }, FALLBACK_PROVIDER_FINANCE_DATA);
}
