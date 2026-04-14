import Dashboard from '@/src/components/features/Dashboard/Dashboard';
import { getDashboardInit } from '@/src/lib/api/dashboard';
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
    const token = cookieStore.get('session')?.value;
    const sessionUser = await getSessionUser();

    // Use org_id from custom claims if available
    const orgId = sessionUser?.org_id;

    let notifications: Notification[] = [];
    let subscriptions: Subscription[] = [];

    if (token && orgId) {
        try {
            const data = await getDashboardInit(token, orgId);
            notifications = data.notifications;
            subscriptions = data.subscriptions;
        } catch (error) {
            console.error('[DashboardPage] API failed and no fallback allowed:', error);
            // In a real app, you might redirect to an error page or show a toast
        }
    }

    // Default to empty arrays if data is missing
    if (!notifications.length && !subscriptions.length && !token) {
        notifications = FALLBACK_DASHBOARD_DATA.notifications;
        subscriptions = FALLBACK_DASHBOARD_DATA.subscriptions;
    }

    return (
        <Dashboard
            notifications={notifications}
            subscriptions={subscriptions}
        />
    );
}
