import { apiFetch, executeWithFallback } from './config';
import { mapSubscription } from './dashboard';
export { mapBillingPeriod } from '../utils/product';
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
  ReorderStepsDTO,
  Product,
  ProductDTO,
  OnboardingStep
} from './types';
import {
  FALLBACK_PROVIDER_DASHBOARD_DATA,
  FALLBACK_PROVIDER_FINANCE_DATA,
  FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA,
  FALLBACK_PROVIDER_PRODUCTS_DATA
} from './mocks';
import { mapBillingPeriod } from '../utils/product';

export function mapProduct(dto: ProductDTO): Product {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description || '',
    price: Number(dto.base_price ?? dto.price) || 0,
    period: mapBillingPeriod(dto.billing_model || dto.service_type || 'monthly'),
    sold: dto.total_sold || 0,
    productCode: dto.product_code || '',
    category: dto.category || 'General',
    status: (dto.status as any) || 'active',
    icon: dto.icon || 'rocket_launch',
    iconColor: dto.icon_color || '#1978e5',
  };
}

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

export async function getProviderProducts(token: string, orgId: string): Promise<ProductDTO[]> {
  return apiFetch('/products', {
    microservice: 'core',
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
    const productsRaw = Array.isArray(data) ? data : (data as any).products || [];
    return {
      products: productsRaw.map(mapProduct)
    };
  }, FALLBACK_PROVIDER_PRODUCTS_DATA);
}

export function mapOnboardingStep(dto: any): OnboardingStep {
  return {
    id: dto.id,
    name: dto.label,
    description: dto.description || '',
    icon: dto.icon || 'settings',
    type: (dto.type as any) || 'auto',
    requests: (dto.action_requests || []).map((req: any) => ({
      id: req.id,
      title: req.title,
      type: req.request_type,
      config: req.config,
      hasResolved: Array.isArray(req.resolved_requests) && req.resolved_requests.length > 0
    }))
  };
}

export async function getProviderProductDetailData(id: string, token?: string, orgId?: string) {
  return executeWithFallback(async () => {
    // 1. Fetch Product with Steps
    const data = await apiFetch<any>(`/products/${id}`, {
      microservice: 'core',
      token,
      orgId
    });

    if (!data) return FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA;

    // 2. Map Product
    const productDTO: ProductDTO = {
      id: data.id,
      product_code: data.product_code,
      name: data.name,
      description: data.description,
      icon: data.icon,
      icon_color: data.icon_color,
      service_type: data.service_type,
      base_price: data.base_price,
      billing_model: data.billing_model,
      price: data.price,
      total_sold: data.total_sold,
      status: data.status,
      category: data.category
    };

    // 3. Map Steps
    const onboardingSteps = (data.contracting_steps || []).map(mapOnboardingStep);

    // 4. Extract Metadata
    const metadata = data.metadata?.custom_attributes || {};

    return {
      product: mapProduct(productDTO),
      onboardingSteps,
      metadata,
      requests: [] // Planned for second iteration
    };
  }, FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA);
}

/**
 * Create a new product (Core API)
 */
export async function createProduct(token?: string, orgId?: string, dto?: CreateProductDTO) {
  return apiFetch('/products', {
    method: 'POST',
    microservice: 'core',
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
    microservice: 'core',
    token,
    orgId,
    body: JSON.stringify(dto),
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Update product metadata (Core API)
 */
export async function updateProductMetadata(productId: string, token: string, orgId: string, customAttributes: Record<string, any>) {
  return apiFetch(`/products/${productId}/metadata`, {
    method: 'PUT',
    microservice: 'core',
    token,
    orgId,
    context: 'provider:productDetail:updateMetadata',
    body: JSON.stringify({ custom_attributes: customAttributes }),
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Add a step to a product (Core API)
 */
export async function createProductStep(productId: string, token: string, orgId: string, dto: CreateContractingStepDTO) {
  return apiFetch(`/products/${productId}/steps`, {
    method: 'POST',
    microservice: 'core',
    token,
    orgId,
    context: 'provider:productDetail:addStep',
    body: JSON.stringify(dto),
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Update step metadata (Core API)
 */
export async function updateProductStepMetadata(productId: string, stepId: string, token: string, orgId: string, data: any) {
  return apiFetch(`/products/${productId}/steps/${stepId}`, {
    method: 'PUT',
    microservice: 'core',
    token,
    orgId,
    context: 'provider:productDetail:updateStep',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Create a new action request within a step
 */
export async function createActionRequest(productId: string, stepId: string, token: string, orgId: string, data: any) {
  return apiFetch(`/products/${productId}/steps/${stepId}/action-requests`, {
    method: 'POST',
    microservice: 'core',
    token,
    orgId,
    context: 'provider:productDetail:createActionRequest',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Update an existing action request
 */
export async function updateActionRequest(requestId: string, token: string, orgId: string, data: any) {
  return apiFetch(`/action-requests/${requestId}`, {
    method: 'PUT',
    microservice: 'core',
    token,
    orgId,
    context: 'provider:productDetail:updateActionRequest',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Delete an action request
 */
export async function deleteActionRequest(requestId: string, token: string, orgId: string) {
  return apiFetch(`/action-requests/${requestId}`, {
    method: 'DELETE',
    microservice: 'core',
    token,
    orgId,
    context: 'provider:productDetail:deleteActionRequest'
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
 * Delete a contracting step from a product (Core API)
 */
export async function deleteProductStep(productId: string, stepId: string, token: string, orgId: string) {
  return apiFetch(`/products/${productId}/steps/${stepId}`, {
    method: 'DELETE',
    microservice: 'core',
    token,
    orgId,
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

/**
 * Check if an email exists
 */
export async function checkEmail(email: string, token: string, orgId: string) {
  return apiFetch(`/users/check-email?email=${encodeURIComponent(email)}`, {
    microservice: 'core',
    token,
    orgId
  });
}

/**
 * Create Subscription for a Client
 */
export async function createSubscription(token: string, orgId: string, data: any) {
  return apiFetch(`/subscriptions`, {
    method: 'POST',
    microservice: 'core',
    token,
    orgId,
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Create a new client Organization (when email not found in platform)
 */
export async function createClientOrganization(token: string, orgId: string, data: {
  legal_name: string;
  email: string;
  client_type?: string;
}) {
  return apiFetch(`/organizations`, {
    method: 'POST',
    microservice: 'core',
    token,
    orgId,
    body: JSON.stringify({
      client_type: data.client_type || 'legal_entity',
      dominio: data.email.split('@')[1] || 'unknown',
      legal_name: data.legal_name,
      email: data.email,
    }),
    headers: { 'Content-Type': 'application/json' }
  });
}
