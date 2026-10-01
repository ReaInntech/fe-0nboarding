import React from 'react';
import Dashboard from '@/src/components/features/Dashboard/Dashboard';
import { getDashboardInit } from '@/src/lib/api/dashboard';
import { getProviderBrandingByIdentifier } from '@/src/lib/api/provider';
import { Notification, Subscription } from '@/src/lib/api/types';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface BrandedDashboardProps {
  params: Promise<{
    providerSlug: string;
  }>;
}

export default async function BrandedDashboardPage({ params }: BrandedDashboardProps) {
  const { providerSlug } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get('id_token')?.value;
  const sessionUser = await getSessionUser();
  const orgId = sessionUser?.org_id || '222ef029-0639-4838-8379-334a17d5ef14';

  let notifications: Notification[] = [];
  let subscriptions: Subscription[] = [];

  if (token) {
    try {
      // Scoped fetch: only subscriptions belonging to this provider
      const data = await getDashboardInit(token, orgId, { providerSlug });
      notifications = data.notifications || [];
      subscriptions = data.subscriptions || [];
    } catch (error) {
      console.error(`[BrandedDashboard] Error fetching subscriptions for provider "${providerSlug}":`, error);
    }
  }

  // Security Access Rule:
  // User can only access this branded portal if they have at least one subscription with this provider.
  if (subscriptions.length === 0) {
    console.warn(`[BrandedDashboard] Access denied: User has no active subscriptions with provider "${providerSlug}". Redirecting to /dashboard.`);
    redirect('/dashboard');
  }

  return (
    <Dashboard
      notifications={notifications}
      subscriptions={subscriptions}
      userProfile={sessionUser}
    />
  );
}
