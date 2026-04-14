import { apiFetch, executeWithFallback } from './config';
import { FALLBACK_DASHBOARD_DATA } from './mocks';
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

export function mapSubscription(dto: SubscriptionDTO): Subscription {
  return {
    id: dto.id,
    name: dto.name,
    tier: dto.tier_name,
    icon: dto.icon_slug,
    status: dto.status as Subscription['status'],
    progressLabel: "Current Stage",
    progressValue: dto.current_milestone,
    progressPct: dto.progress_percentage,
    price: dto.monthly_price ? `$${(dto.monthly_price / 100).toFixed(2)}` : undefined,
    pricePeriod: "/mo",
  };
}

export async function getNotifications(token: string, orgId: string): Promise<Notification[]> {
  const data = await apiFetch<NotificationDTO[]>('/notifications', { token, orgId });
  return (data || []).map(mapNotification);
}

export async function getSubscriptions(token: string, orgId: string): Promise<Subscription[]> {
  const data = await apiFetch<SubscriptionDTO[]>('/subscriptions', { token, orgId });
  return (data || []).map(mapSubscription);
}

export async function markNotificationRead(id: string, token: string, orgId: string) {
  return apiFetch(`/notifications/${id}`, {
    method: 'PATCH',
    token,
    orgId,
    body: JSON.stringify({ is_read: true }),
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * BFF Aggregator for Dashboard Initial State
 */
export async function getDashboardInit(token: string, orgId: string) {
  return executeWithFallback(async () => {
    const [notifications, subscriptions] = await Promise.all([
      getNotifications(token, orgId),
      getSubscriptions(token, orgId),
    ]);

    return {
      notifications,
      subscriptions,
    };
  }, FALLBACK_DASHBOARD_DATA);
}
