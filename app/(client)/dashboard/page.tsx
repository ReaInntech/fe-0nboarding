import Dashboard from '@/src/components/features/Dashboard/Dashboard';
import { getDashboardInit } from '@/src/lib/api/dashboard';
import { getMockStrategy } from '@/src/lib/api/config';
import { FALLBACK_DASHBOARD_DATA } from '@/src/lib/api/mocks';
import { Notification, Subscription } from '@/src/lib/api/types';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';

export const metadata = {
    title: 'Dashboard | 0nbording',
    description: 'Manage your services and notifications.',
};

export default async function DashboardPage() {
    // SSR Fetching with Auth Token
    const cookieStore = await cookies();
    const token = cookieStore.get('id_token')?.value;
    const sessionUser = await getSessionUser();

    // Use org_id from custom claims or default client org
    const orgId = sessionUser?.org_id || '222ef029-0639-4838-8379-334a17d5ef14';

    let notifications: Notification[] = [];
    let subscriptions: Subscription[] = [];

    console.log('[DashboardPage] Auth Check:', { hasToken: !!token, hasOrgId: !!orgId, userId: sessionUser?.uid });

    if (token) {
        try {
            const data = await getDashboardInit(token, orgId);
            notifications = data.notifications || [];
            subscriptions = data.subscriptions || [];
            console.log(`[DashboardPage] Fetched ${subscriptions.length} subscriptions`);
        } catch (error) {
            console.error('[DashboardPage] API failed:', error);
        }
    }

    // Use strategy-aware mock logic
    const strategy = getMockStrategy();
    const hasData = notifications.length > 0 || subscriptions.length > 0;
    
    if (strategy === 'always' || (!hasData && (strategy === 'fallback' || process.env.NODE_ENV === 'development'))) {
        console.log(`[DashboardPage] Using fallback mock data (Strategy: ${strategy})`);
        if (!notifications.length) notifications = FALLBACK_DASHBOARD_DATA.notifications;
        if (!subscriptions.length) subscriptions = FALLBACK_DASHBOARD_DATA.subscriptions;
    }

    return (
        <Dashboard
            notifications={notifications}
            subscriptions={subscriptions}
        />
    );
}
