import React from 'react';
import ProviderFinance from '@/src/components/features/ProviderFinance/ProviderFinance';
import { getProviderFinanceData, FALLBACK_PROVIDER_FINANCE_DATA } from '@/src/lib/api';

export const metadata = {
    title: 'Finance Overview | Provider Portal',
    description: 'Track your revenue, pending payouts, and recent payment history.',
};

export default async function ProviderFinancePage() {
    // SSR Fetching
    const apiData = await getProviderFinanceData();
    
    // Fallback to mock data if API fails or is not yet implemented
    const kpis = apiData?.kpis || FALLBACK_PROVIDER_FINANCE_DATA.kpis;
    const revenueData = apiData?.revenueData || FALLBACK_PROVIDER_FINANCE_DATA.revenueData;
    const distributionData = apiData?.distributionData || FALLBACK_PROVIDER_FINANCE_DATA.distributionData;
    const transactions = apiData?.transactions || FALLBACK_PROVIDER_FINANCE_DATA.transactions;
    const productsFilterList = apiData?.productsFilterList || FALLBACK_PROVIDER_FINANCE_DATA.productsFilterList;
    const clientsFilterList = apiData?.clientsFilterList || FALLBACK_PROVIDER_FINANCE_DATA.clientsFilterList;
    const paymentMethodsList = apiData?.paymentMethodsList || FALLBACK_PROVIDER_FINANCE_DATA.paymentMethodsList;

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
