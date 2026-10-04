import ProviderDashboard from '@/src/components/features/ProviderDashboard/ProviderDashboard';
import { getProviderDashboardInit } from '@/src/lib/api/provider';
import { Subscription } from '@/src/lib/api/types';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
    title: 'Provider Dashboard | 0nbording',
    description: 'Manage client subscriptions and documents.',
};

export default async function ProviderDashboardPage() {
    // SSR Fetching with Auth Token
    const cookieStore = await cookies();
    const token = cookieStore.get('id_token')?.value;
    const sessionUser = await getSessionUser();

    // Use org_id from custom claims or provider default
    const orgId = sessionUser?.org_id || '8a6ceaa0-c2e0-4945-93eb-bb04b7a2a2a9';

    let subscriptions: Subscription[] = [];
    let stats = null;

    try {
        const data = await getProviderDashboardInit(token || '', orgId);
        subscriptions = data.subscriptions || [];
        console.log(`[ProviderDashboardPage] Loaded ${subscriptions.length} subscriptions`);
        if (data.stats) stats = data.stats;
    } catch (error) {
        console.error('[ProviderDashboardPage] API failed:', error);
    }

    return (
        <ProviderDashboard
            subscriptions={subscriptions}
            stats={stats}
            userProfile={sessionUser}
        />
    );
}
