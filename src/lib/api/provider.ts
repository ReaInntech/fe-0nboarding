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

export async function deleteProviderSubscription(id: string, token?: string, orgId?: string): Promise<{ success: boolean; message: string; id: string }> {
  return apiFetch<{ success: boolean; message: string; id: string }>(`/dashboard/subscriptions/${id}`, {
    method: 'DELETE',
    microservice: 'provider',
    token,
    orgId,
  });
}

export async function updateProviderSubscriptionStatus(id: string, status: string, token?: string, orgId?: string): Promise<{ success: boolean; message: string; subscription: any }> {
  return apiFetch<{ success: boolean; message: string; subscription: any }>(`/dashboard/subscriptions/${id}/status`, {
    method: 'PATCH',
    microservice: 'provider',
    token,
    orgId,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
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
  try {
    const data = await getProviderProducts(token, orgId);
    const productsRaw = Array.isArray(data) ? data : (data as any).products || [];
    return {
      products: productsRaw.map(mapProduct)
    };
  } catch (error) {
    console.error('[ProviderAPI] getProviderProductsInit failed:', error);
    return { products: [] };
  }
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
  // 1. Fetch Product with Steps
  const data = await apiFetch<any>(`/products/${id}`, {
    microservice: 'core',
    token,
    orgId
  });

  if (!data) return null;

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
    requests: []
  };
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
  try {
    const [subscriptions, stats] = await Promise.all([
      getProviderSubscriptions(token, orgId),
      getProviderStats(token, orgId),
    ]);

    return {
      subscriptions: subscriptions || [],
      stats: stats || null,
    };
  } catch (error) {
    console.error('[ProviderAPI] getProviderDashboardInit failed:', error);
    return {
      subscriptions: [],
      stats: null,
    };
  }
}

/**
 * BFF Aggregator for Provider Finance Initial State
 */
export async function getProviderFinanceInit(token: string, orgId: string) {
  try {
    const [kpis, revenueHistory] = await Promise.all([
      getFinanceKPIs(token, orgId),
      getRevenueHistory(token, orgId),
    ]);

    return {
      kpis,
      revenueHistory: revenueHistory || [],
    };
  } catch (error) {
    console.error('[ProviderAPI] getProviderFinanceInit failed:', error);
    return {
      kpis: null,
      revenueHistory: [],
    };
  }
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

export interface ProviderSettingsBranding {
  logo_url?: string | null;
  isotype_url?: string | null;
  favicon_url?: string | null;
  brand_primary_color?: string;
  brand_secondary_color?: string;
  brand_accent_color?: string;
}

export interface ProviderSettingsLocalization {
  currency?: string;
  language?: string;
  timezone?: string;
  date_format?: string;
}

export interface ProviderSettingsNotifications {
  notification_email?: string;
  mute_notifications?: boolean;
  email_on_request?: boolean;
  inapp_on_request?: boolean;
  email_on_ticket?: boolean;
  inapp_on_ticket?: boolean;
  email_on_payment?: boolean;
  inapp_on_payment?: boolean;
}

export interface ProviderOrganizationProfile {
  legal_name?: string;
  trade_name?: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  website?: string;
}

export interface ProviderSettingsResponse {
  organization: any;
  branding: ProviderSettingsBranding;
  localization: ProviderSettingsLocalization;
  notifications: ProviderSettingsNotifications;
  plan?: {
    name: string;
    renewal_date: string;
    products_used: number;
    products_limit: number;
    clients_used: number;
    clients_limit: number;
    storage_used_gb: number;
    storage_limit_gb: number;
  };
}

/**
 * Fetch unified provider settings (Provider API + Core Organization)
 */
export async function getProviderSettings(token?: string, orgId?: string): Promise<ProviderSettingsResponse> {
  // 1. Fetch Provider Settings from onbording-provider-api
  const providerSettings = await apiFetch<any>('/settings', {
    microservice: 'provider',
    token,
    orgId,
  }).catch(() => null);

  // 2. Fetch Organization legal profile from onbording-core-api
  let orgData: any = {
    id: orgId || '',
    legal_name: '',
    trade_name: '',
    tax_id: '',
    country: 'CO',
    client_type: 'legal_entity',
  };

  if (orgId) {
    try {
      const orgRes = await apiFetch<any>(`/organizations/${orgId}`, {
        microservice: 'core',
        token,
        orgId,
      });
      if (orgRes) {
        orgData = { ...orgData, ...orgRes };
      }
    } catch (err) {
      console.warn('Could not fetch organization from core-api:', err);
    }
  }

  return {
    organization: orgData,
    branding: {
      logo_url: providerSettings?.logo_url ?? '',
      isotype_url: providerSettings?.isotype_url ?? '',
      favicon_url: providerSettings?.favicon_url ?? '',
      brand_primary_color: providerSettings?.brand_primary_color ?? '#1978e5',
      brand_secondary_color: providerSettings?.brand_secondary_color ?? '#0f172a',
      brand_accent_color: providerSettings?.brand_accent_color ?? '#38bdf8',
    },
    localization: {
      currency: providerSettings?.currency ?? 'USD',
      language: providerSettings?.language ?? 'en',
      timezone: providerSettings?.timezone ?? 'UTC',
      date_format: providerSettings?.date_format ?? 'YYYY-MM-DD',
    },
    notifications: {
      notification_email: providerSettings?.notification_email ?? '',
      mute_notifications: providerSettings?.mute_notifications ?? false,
      email_on_request: providerSettings?.email_on_request ?? true,
      inapp_on_request: providerSettings?.inapp_on_request ?? true,
      email_on_ticket: providerSettings?.email_on_ticket ?? true,
      inapp_on_ticket: providerSettings?.inapp_on_ticket ?? true,
      email_on_payment: providerSettings?.email_on_payment ?? true,
      inapp_on_payment: providerSettings?.inapp_on_payment ?? true,
    },
    plan: {
      name: 'Enterprise Plan',
      renewal_date: 'N/A',
      products_used: 0,
      products_limit: 10,
      clients_used: 0,
      clients_limit: 50,
      storage_used_gb: 0,
      storage_limit_gb: 100,
    },
  };
}

/**
 * Update Provider Branding Settings (Provider API)
 */
export async function updateProviderBranding(token?: string, orgId?: string, dto?: ProviderSettingsBranding) {
  return apiFetch('/settings/branding', {
    method: 'PUT',
    microservice: 'provider',
    token,
    orgId,
    body: JSON.stringify(dto),
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Update Provider Localization Settings (Provider API)
 */
export async function updateProviderLocalization(token?: string, orgId?: string, dto?: ProviderSettingsLocalization) {
  return apiFetch('/settings/localization', {
    method: 'PUT',
    microservice: 'provider',
    token,
    orgId,
    body: JSON.stringify(dto),
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Update Provider Notification Preferences (Provider API)
 */
export async function updateProviderNotifications(token?: string, orgId?: string, dto?: ProviderSettingsNotifications) {
  return apiFetch('/settings/notifications', {
    method: 'PUT',
    microservice: 'provider',
    token,
    orgId,
    body: JSON.stringify(dto),
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Update Organization Profile (Core API)
 */
export async function updateOrganizationProfile(orgId: string, token: string | undefined, dto: ProviderOrganizationProfile) {
  return apiFetch(`/organizations/${orgId}`, {
    method: 'PUT',
    microservice: 'core',
    token,
    orgId,
    body: JSON.stringify(dto),
    headers: { 'Content-Type': 'application/json' },
  });
}

export interface ProviderClient {
  id: string;
  legal_name: string;
  trade_name?: string;
  dominio: string;
  email: string;
  phone?: string;
  country?: string;
  client_type: 'legal_entity' | 'natural_person';
  created_at: string;
  subscriptions_count: number;
  active_subscriptions_count: number;
  status: 'active' | 'in_progress' | 'suspended';
  subscriptions?: Array<{
    id: string;
    productName?: string;
    status: string;
    price: number;
  }>;
}

export interface ProviderClientsMetrics {
  total: number;
  active: number;
  in_progress: number;
  suspended: number;
}

export interface ProviderClientsResponse {
  clients: ProviderClient[];
  metrics: ProviderClientsMetrics;
}

export interface CreateClientDTO {
  legal_name: string;
  trade_name?: string;
  admin_name?: string;
  email: string;
  client_type?: 'legal_entity' | 'natural_person';
  tax_id?: string;
  phone?: string;
  country?: string;
  address?: string;
  role?: 'owner' | 'admin' | 'member' | 'viewer';
  product_id?: string;
}

export interface BulkImportResult {
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  successList: any[];
  errors: Array<{
    row: number;
    email: string;
    legal_name?: string;
    error: string;
  }>;
}

/**
 * Fetch Provider Clients directory and metrics (Provider API)
 */
export async function getProviderClients(token?: string, orgId?: string): Promise<ProviderClientsResponse> {
  try {
    const data = await apiFetch<any>('/clients', {
      microservice: 'provider',
      token,
      orgId,
    });
    return data || {
      metrics: { total: 0, active: 0, in_progress: 0, suspended: 0 },
      clients: []
    };
  } catch (error) {
    console.error('[ProviderAPI] getProviderClients failed:', error);
    return {
      metrics: { total: 0, active: 0, in_progress: 0, suspended: 0 },
      clients: []
    };
  }
}

/**
 * Check domain and email availability (Provider API)
 */
export async function checkClientDomain(domain: string, email?: string, token?: string, orgId?: string) {
  const query = new URLSearchParams();
  if (domain) query.set('domain', domain);
  if (email) query.set('email', email);

  return apiFetch<any>(`/clients/check-domain?${query.toString()}`, {
    microservice: 'provider',
    token,
    orgId,
  });
}

/**
 * Create a new client individually (Provider API)
 */
export async function createProviderClient(dto: CreateClientDTO, token?: string, orgId?: string) {
  return apiFetch('/clients', {
    method: 'POST',
    microservice: 'provider',
    token,
    orgId,
    body: JSON.stringify(dto),
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Bulk import clients via CSV rows (Provider API)
 */
export async function bulkImportClients(clients: CreateClientDTO[], token?: string, orgId?: string): Promise<BulkImportResult> {
  return apiFetch<BulkImportResult>('/clients/bulk-import', {
    method: 'POST',
    microservice: 'provider',
    token,
    orgId,
    body: JSON.stringify({ clients }),
    headers: { 'Content-Type': 'application/json' },
  });
}
