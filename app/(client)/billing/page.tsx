import React from 'react';
import UnifiedBilling from '@/src/components/features/UnifiedBilling/UnifiedBilling';
import { getBillingData, FALLBACK_BILLING_DATA } from '@/src/lib/api';

export const metadata = {
    title: 'Billing | Saslution',
    description: 'Manage your payments and subscriptions.',
};

export default async function BillingPage() {
    // SSR Fetching
    const apiData = await getBillingData();
    
    // Fallback to mock data if API fails or is not yet implemented
    const transactions = apiData?.transactions || FALLBACK_BILLING_DATA.transactions;
    const methods = apiData?.methods || FALLBACK_BILLING_DATA.methods;

    return (
        <UnifiedBilling 
            transactions={transactions} 
            methods={methods} 
        />
    );
}
