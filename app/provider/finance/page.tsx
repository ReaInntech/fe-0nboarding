import ProviderFinance from '@/src/components/features/ProviderFinance/ProviderFinance';
import { getProviderFinanceInit } from '@/src/lib/api/provider';
import { FinanceKpis, RevenueDataPoint } from '@/src/lib/api/types';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';

export const metadata = {
    title: 'Finance Overview | 0nbording',
    description: 'Track your revenue, pending payouts, and recent payment history.',
};

const EMPTY_KPIS: FinanceKpis = {
    totalRevenue: 0,
    pendingPayout: 0,
    activeClients: 0,
    successRate: 0,
    growth: 0,
};

export default async function ProviderFinancePage() {
    // SSR Fetching with Auth Token
    const cookieStore = await cookies();
    const token = cookieStore.get('id_token')?.value;
    const sessionUser = await getSessionUser();
    
    // Use org_id from custom claims or provider default
    const orgId = sessionUser?.org_id || '8a6ceaa0-c2e0-4945-93eb-bb04b7a2a2a9';

    let kpis: FinanceKpis = EMPTY_KPIS;
    let revenueData: RevenueDataPoint[] = [];
    let distributionData: any[] = [];
    let transactions: any[] = [];
    let productsFilterList: any[] = [];
    let clientsFilterList: any[] = [];
    let paymentMethodsList: any[] = [];

    try {
        const data = await getProviderFinanceInit(token || '', orgId);
        if (data.kpis) kpis = data.kpis;
        if (data.revenueHistory) revenueData = data.revenueHistory;
    } catch (error) {
        console.error('[ProviderFinancePage] API failed:', error);
    }

    return (
        <ProviderFinance 
            kpis={kpis}
            revenueData={revenueData}
            distributionData={distributionData}
            transactions={transactions}
            productsFilterList={productsFilterList}
            clientsFilterList={clientsFilterList}
            paymentMethodsList={paymentMethodsList}
            userProfile={sessionUser}
        />
    );
}
