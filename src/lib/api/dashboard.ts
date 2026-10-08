import { humanizeBillingModel, formatBillingPeriod } from "../utils/product";
import { apiFetch } from './config';
import { Notification, NotificationDTO, Subscription, SubscriptionDTO } from './types';

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Just now';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch {
    return 'Recently';
  }
}

export function mapNotification(dto: NotificationDTO): Notification {
  const validVariants = ['critical', 'warning', 'info', 'success', 'error'] as const;
  const rawVariant = dto.variant || dto.priority;
  const variant = validVariants.includes(rawVariant as any)
    ? (rawVariant as any)
    : 'info';

  return {
    id: dto.id,
    title: dto.title,
    time: formatRelativeTime(dto.created_at),
    message: dto.message,
    variant,
    is_read: dto.is_read ?? false,
    subscription_id: dto.subscription_id,
    action_url: dto.action_url,
    metadata: dto.metadata,
    created_at: dto.created_at,
  };
}

export function mapSubscription(dto: any): Subscription {
  return {
    id: dto.id,
    name: dto.product?.name || 'Service',
    tier: dto.product?.billing_model ? `${humanizeBillingModel(dto.product.billing_model)} Plan` : 'Standard Plan',
    icon: dto.product?.icon || 'hub',
    status: dto.status as Subscription['status'],
    progressLabel: dto.current_step?.label || dto.progress_label || '',
    progressPct: dto.progress_pct || 0,
    hasActionRequest: dto.has_action_request || false,
    price: dto.price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dto.price) : undefined,
    pricePeriod: formatBillingPeriod(dto.product?.billing_model),
    product: {
      name: dto.product?.name || '',
      icon: dto.product?.icon || '',
      iconColor: dto.product?.icon_color || '',
    },
    
    provider: dto.provider ? {
      id: dto.provider.id,
      name: dto.provider.name,
      slug: dto.provider.slug,
      dominio: dto.provider.dominio,
      logo_url: dto.provider.logo_url,
    } : (dto.product?.organization ? {
      id: dto.product.organization.id,
      name: dto.product.organization.trade_name || dto.product.organization.legal_name || 'Provider',
      slug: dto.product.organization.slug,
      dominio: dto.product.organization.dominio,
      logo_url: dto.product.organization.logo_url,
    } : undefined),

    // Map provider-specific aliased details
    client: dto.client ? {
      id: dto.client.id,
      legalName: dto.client.legal_name || dto.client.legalName || '',
      tradeName: dto.client.trade_name || dto.client.tradeName || '',
      clientType: dto.client.client_type || dto.client.clientType || 'legal_entity',
      email: dto.client.email || '',
      phone: dto.client.phone || '',
      taxId: dto.client.tax_id || dto.client.taxId || '',
      country: dto.client.country || '',
      users: dto.client.users || [],
    } : undefined,
    tierName: dto.tierName || dto.tier || (dto.product?.billing_model ? `${humanizeBillingModel(dto.product.billing_model)} Plan` : 'Standard Plan'),
    monthlyPrice: dto.monthlyPrice || Number(dto.price) || 0,
    payments: dto.payments || [],
    documents: dto.documents || [],
    provisionedAt: dto.provisionedAt || dto.provisioned_at || null,
    steps: dto.steps || [],
    requests: dto.requests || [],
    can_delete: dto.can_delete !== undefined ? dto.can_delete : true,
    has_approved_payment: dto.has_approved_payment !== undefined ? dto.has_approved_payment : false,
  };
}

export interface EffectiveProvider {
  id: string;
  name: string;
  slug: string;
  dominio?: string;
  logo_url?: string;
  subscriptionCount: number;
}

export function getEffectiveProviders(subscriptions: Subscription[]): {
  providers: EffectiveProvider[];
  singleProvider: boolean;
  providerSlug?: string;
  defaultProvider?: EffectiveProvider;
} {
  const providerMap = new Map<string, EffectiveProvider>();

  for (const sub of subscriptions) {
    if (sub.provider && sub.provider.slug) {
      const existing = providerMap.get(sub.provider.slug);
      if (existing) {
        existing.subscriptionCount += 1;
      } else {
        providerMap.set(sub.provider.slug, {
          id: sub.provider.id,
          name: sub.provider.name,
          slug: sub.provider.slug,
          dominio: sub.provider.dominio,
          logo_url: sub.provider.logo_url,
          subscriptionCount: 1,
        });
      }
    }
  }

  const providers = Array.from(providerMap.values());
  const singleProvider = providers.length === 1;

  return {
    providers,
    singleProvider,
    providerSlug: singleProvider ? providers[0].slug : undefined,
    defaultProvider: singleProvider ? providers[0] : undefined,
  };
}

export async function getNotifications(token?: string, orgId?: string): Promise<Notification[]> {
  try {
    const data = await apiFetch<NotificationDTO[]>('/notifications', { token, orgId });
    return (data || []).map(mapNotification);
  } catch (error) {
    console.error('[DashboardAPI] getNotifications failed:', error);
    return [];
  }
}

export async function getSubscriptions(
  token?: string,
  orgId?: string,
  filters?: { providerId?: string; providerSlug?: string }
): Promise<Subscription[]> {
  try {
    let endpoint = '/subscriptions';
    const params = new URLSearchParams();
    if (filters?.providerId) params.append('providerId', filters.providerId);
    if (filters?.providerSlug) params.append('providerSlug', filters.providerSlug);
    const qs = params.toString();
    if (qs) endpoint += `?${qs}`;

    const data = await apiFetch<SubscriptionDTO[]>(endpoint, { token, orgId });
    return (data || []).map(mapSubscription);
  } catch (error) {
    console.error('[DashboardAPI] getSubscriptions failed:', error);
    return [];
  }
}

export async function markNotificationRead(id: string, token?: string, orgId?: string) {
  return apiFetch(`/notifications/${id}`, {
    method: 'PATCH',
    microservice: 'core',
    token,
    orgId,
    body: JSON.stringify({ is_read: true }),
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function getUnreadNotificationsCount(token?: string, orgId?: string): Promise<number> {
  try {
    const data = await apiFetch<{ unread_count: number }>('/notifications/unread-count', {
      microservice: 'core',
      token,
      orgId,
    });
    return data?.unread_count || 0;
  } catch {
    return 0;
  }
}

export async function markAllNotificationsRead(token?: string, orgId?: string) {
  return apiFetch('/notifications/read-all', {
    method: 'PATCH',
    microservice: 'core',
    token,
    orgId,
  });
}

/**
 * Delete a single notification (invoked on Swipe Right)
 */
export async function deleteNotification(id: string, token?: string, orgId?: string) {
  return apiFetch(`/notifications/${id}`, {
    method: 'DELETE',
    microservice: 'core',
    token,
    orgId,
  });
}

/**
 * Permanently delete all notifications (invoked on Clear All in Client view)
 */
export async function clearAllNotifications(token?: string, orgId?: string) {
  return apiFetch('/notifications/clear-all', {
    method: 'DELETE',
    microservice: 'core',
    token,
    orgId,
  });
}

/**
 * RF-TR-03: Request 6-digit OTP code for Provider Mode activation
 */
export async function generateProviderOtp(token?: string) {
  return apiFetch<any>('/auth/otp/generate', {
    method: 'POST',
    microservice: 'core',
    token,
  });
}

/**
 * RF-TR-03: Verify 6-digit OTP code for Provider Mode activation
 */
export async function verifyProviderOtp(code: string, token?: string) {
  return apiFetch<any>('/auth/otp/verify', {
    method: 'POST',
    microservice: 'core',
    token,
    body: JSON.stringify({ code }),
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * BFF Aggregator for Dashboard Initial State
 */
export async function getDashboardInit(
  token: string,
  orgId: string,
  filters?: { providerId?: string; providerSlug?: string }
) {
  const [notifications, subscriptions] = await Promise.all([
    getNotifications(token, orgId),
    getSubscriptions(token, orgId, filters),
  ]);

  return {
    notifications,
    subscriptions,
  };
}
