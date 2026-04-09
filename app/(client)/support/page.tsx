import React from 'react';
import SupportCenter from '@/src/components/features/Support/SupportCenter';
import { getSupportData, FALLBACK_SUPPORT_DATA } from '@/src/lib/api';

export const metadata = {
    title: 'Support Center | Saslution',
    description: 'Get help with your services and managed tickets.',
};

export default async function SupportPage() {
    // SSR Fetching
    const apiData = await getSupportData();
    
    // Fallback to mock data if API fails or is not yet implemented
    const stats = apiData?.stats || FALLBACK_SUPPORT_DATA.stats;
    const ticketListData = apiData?.ticketListProps || FALLBACK_SUPPORT_DATA.ticketListProps;

    // Header props for Support Center
    const headerProps = {
        title: "Support Center",
        subtitle: "How can we help you today? Manage your tickets and find solutions.",
        badge: { text: "24/7 Support Available", icon: "support_agent" },
        icon: "help",
        iconColor: "text-[#1978e5]",
        badgeText: "24/7 Support Available",
        productId: "support"
    };

    return (
        <SupportCenter 
            headerProps={headerProps}
            stats={stats}
            ticketListProps={{
                ...ticketListData,
                title: "Recent Tickets"
            }} 
        />
    );
}
