import React from 'react';
import ProviderDashboard from '@/src/components/features/ProviderDashboard/ProviderDashboard';
import { getProviderDashboardData, FALLBACK_PROVIDER_DASHBOARD_DATA } from '@/src/lib/api';

export const metadata = {
    title: 'Provider Dashboard | Saslution',
    description: 'Manage client subscriptions and documents.',
};

export default async function ProviderDashboardPage() {
    // SSR Fetching
    const apiData = await getProviderDashboardData();
    
    // Fallback to mock data if API fails or is not yet implemented
    const subscriptions = apiData?.subscriptions || FALLBACK_PROVIDER_DASHBOARD_DATA.subscriptions;

    return (
        <ProviderDashboard 
            subscriptions={subscriptions} 
        />
    );
}
