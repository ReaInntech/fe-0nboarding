import { apiFetch } from './config';
import { Notification, NotificationDTO, Subscription, SubscriptionDTO } from './types';

export function mapNotification(dto: NotificationDTO): Notification {
  // Use a safer variant cast with a fallback
  const validVariants = ['critical', 'warning', 'info', 'success'] as const;
  const variant = validVariants.includes(dto.priority as any)
    ? (dto.priority as Notification['variant'])
    : 'info';

  return {
    title: dto.title,
    time: dto.created_at, // Ideally format this to "X mins ago"
    message: dto.message,
    variant,
  };
}

export function mapSubscription(dto: any): Subscription {
  return {
    id: dto.id,
    name: dto.product?.name || 'Service',
    tier: dto.product?.billing_model ? `${dto.product.billing_model} Plan` : 'Standard Plan',
    icon: dto.product?.icon || 'hub',
    status: dto.status as Subscription['status'],
    progressLabel: dto.current_step?.label || dto.progress_label || '',
    progressPct: dto.progress_pct || 0,
    hasActionRequest: dto.has_action_request || false,
    price: dto.price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dto.price) : undefined,
    pricePeriod: dto.product?.billing_model === 'one_time' ? "" : (dto.product?.billing_model ? `/${dto.product.billing_model.toLowerCase()}` : "/mo"),
    product: {
      name: dto.product?.name || '',
      icon: dto.product?.icon || '',
      iconColor: dto.product?.icon_color || '',
    },
    
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
    tierName: dto.tierName || dto.tier || (dto.product?.billing_model ? `${dto.product.billing_model} Plan` : 'Standard Plan'),
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

export async function getNotifications(token?: string, orgId?: string): Promise<Notification[]> {
  try {
    const data = await apiFetch<NotificationDTO[]>('/notifications', { token, orgId });
    return (data || []).map(mapNotification);
  } catch (error) {
    console.error('[DashboardAPI] getNotifications failed:', error);
    return [];
  }
}

export async function getSubscriptions(token?: string, orgId?: string): Promise<Subscription[]> {
  try {
    const data = await apiFetch<SubscriptionDTO[]>('/subscriptions', { token, orgId });
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
export async function getDashboardInit(token: string, orgId: string) {
  const [notifications, subscriptions] = await Promise.all([
    getNotifications(token, orgId),
    getSubscriptions(token, orgId),
  ]);

  return {
    notifications,
    subscriptions,
  };
}
