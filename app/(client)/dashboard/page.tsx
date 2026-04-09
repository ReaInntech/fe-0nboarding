import React from 'react';
import Dashboard from '@/src/components/features/Dashboard/Dashboard';
import { getDashboardData, FALLBACK_DASHBOARD_DATA } from '@/src/lib/api';

export const metadata = {
    title: 'Dashboard | Saslution',
    description: 'Manage your services and notifications.',
};

export default async function DashboardPage() {
    // SSR Fetching
    const apiData = await getDashboardData();
    
    // Fallback to mock data if API fails or is not yet implemented
    const notifications = apiData?.notifications || FALLBACK_DASHBOARD_DATA.notifications;
    const subscriptions = apiData?.subscriptions || FALLBACK_DASHBOARD_DATA.subscriptions;

    return (
        <Dashboard 
            notifications={notifications} 
            subscriptions={subscriptions} 
        />
    );
}
