import ProviderDashboard from '@/src/components/features/ProviderDashboard/ProviderDashboard';
import { getProviderDashboardInit } from '@/src/lib/api/provider';
import { getMockStrategy } from '@/src/lib/api/config';
import { FALLBACK_PROVIDER_DASHBOARD_DATA } from '@/src/lib/api/mocks';
import { Subscription } from '@/src/lib/api/types';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';

export const metadata = {
    title: 'Provider Dashboard | 0nbording',
    description: 'Manage client subscriptions and documents.',
};

export default async function ProviderDashboardPage() {
    // SSR Fetching with Auth Token
    const cookieStore = await cookies();
    const token = cookieStore.get('id_token')?.value;
    const sessionUser = await getSessionUser();
    
    // Use org_id from custom claims if available
    const orgId = sessionUser?.org_id;
    const strategy = getMockStrategy();

    let subscriptions: Subscription[] = [];
    let stats = null;

    if (token && orgId) {
        try {
            const data = await getProviderDashboardInit(token, orgId);
            subscriptions = data.subscriptions;
            if (data.stats) stats = data.stats;
        } catch (error) {
            console.error('[ProviderDashboardPage] API failed:', error);
        }
    }

    // Default to mock data only if strategy allows
    const hasNoData = !subscriptions.length;
    if (hasNoData && (strategy === 'always' || (strategy === 'fallback' && (!token || process.env.NODE_ENV === 'development')))) {
        console.log(`[ProviderDashboardPage] Using fallback mock data (Strategy: ${strategy})`);
        subscriptions = FALLBACK_PROVIDER_DASHBOARD_DATA.subscriptions;
        if (!stats) stats = (FALLBACK_PROVIDER_DASHBOARD_DATA as any).stats;
    }

    return (
        <ProviderDashboard 
            subscriptions={subscriptions} 
            stats={stats}
        />
    );
}
