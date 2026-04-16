import ProviderFinance from '@/src/components/features/ProviderFinance/ProviderFinance';
import { getProviderFinanceInit } from '@/src/lib/api/provider';
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

    let kpis: FinanceKpis = FALLBACK_PROVIDER_FINANCE_DATA.kpis;
    let revenueData: RevenueDataPoint[] = FALLBACK_PROVIDER_FINANCE_DATA.revenueHistory;
    let distributionData = FALLBACK_PROVIDER_FINANCE_DATA.distributionData;
    let transactions = FALLBACK_PROVIDER_FINANCE_DATA.transactions;
    let productsFilterList = FALLBACK_PROVIDER_FINANCE_DATA.productsFilterList;
    let clientsFilterList = FALLBACK_PROVIDER_FINANCE_DATA.clientsFilterList;
    let paymentMethodsList = FALLBACK_PROVIDER_FINANCE_DATA.paymentMethodsList;

    if (token && orgId) {
        try {
            const data = await getProviderFinanceInit(token, orgId);
            if (data.kpis) kpis = data.kpis;
            if (data.revenueHistory) revenueData = data.revenueHistory;
        } catch (error) {
            console.error('[ProviderFinancePage] API failed and no fallback allowed:', error);
        }
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
