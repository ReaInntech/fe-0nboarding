import ProviderFinance from '@/src/components/features/ProviderFinance/ProviderFinance';
import { getProviderFinanceInit } from '@/src/lib/api/provider';
import { getMockStrategy } from '@/src/lib/api/config';
import { FALLBACK_PROVIDER_FINANCE_DATA } from '@/src/lib/api/mocks';
import { FinanceKpis, RevenueDataPoint } from '@/src/lib/api/types';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';

export const metadata = {
    title: 'Finance Overview | 0nbording',
    description: 'Track your revenue, pending payouts, and recent payment history.',
};

export default async function ProviderFinancePage() {
    // SSR Fetching with Auth Token
    const cookieStore = await cookies();
    const token = cookieStore.get('id_token')?.value;
    const sessionUser = await getSessionUser();
    
    // Use org_id from custom claims if available
    const orgId = sessionUser?.org_id;
    const strategy = getMockStrategy();

    let kpis: FinanceKpis | null = null;
    let revenueData: RevenueDataPoint[] = [];
    let distributionData: any[] = [];
    let transactions: any[] = [];
    let productsFilterList: any[] = [];
    let clientsFilterList: any[] = [];
    let paymentMethodsList: any[] = [];

    if (token && orgId) {
        try {
            const data = await getProviderFinanceInit(token, orgId);
            if (data.kpis) kpis = data.kpis;
            if (data.revenueHistory) revenueData = data.revenueHistory;
            // Add other mappings if they exist in API
        } catch (error) {
            console.error('[ProviderFinancePage] API failed:', error);
        }
    }

    // Default to mock data only if strategy allows
    const hasNoData = !kpis && !revenueData.length;
    if (hasNoData && (strategy === 'always' || (strategy === 'fallback' && (!token || process.env.NODE_ENV === 'development')))) {
        console.log(`[ProviderFinancePage] Using fallback mock data (Strategy: ${strategy})`);
        kpis = FALLBACK_PROVIDER_FINANCE_DATA.kpis;
        revenueData = FALLBACK_PROVIDER_FINANCE_DATA.revenueHistory;
        distributionData = FALLBACK_PROVIDER_FINANCE_DATA.distributionData;
        transactions = FALLBACK_PROVIDER_FINANCE_DATA.transactions;
        productsFilterList = FALLBACK_PROVIDER_FINANCE_DATA.productsFilterList;
        clientsFilterList = FALLBACK_PROVIDER_FINANCE_DATA.clientsFilterList;
        paymentMethodsList = FALLBACK_PROVIDER_FINANCE_DATA.paymentMethodsList;
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
        />
    );
}
