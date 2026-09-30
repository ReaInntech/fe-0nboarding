import React from 'react';
import SupportCenter from '@/src/components/features/Support/SupportCenter';
import { getSupportData } from '@/src/lib/api/support';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';

export const metadata = {
    title: 'Support Center | 0nbording',
    description: 'Get help with your services and managed tickets.',
};

export default async function SupportPage() {
    // SSR Fetching
    const cookieStore = await cookies();
    const token = cookieStore.get('id_token')?.value;
    const sessionUser = await getSessionUser();
    const orgId = sessionUser?.org_id;

    let apiData: any = null;
    try {
        apiData = await getSupportData(token, orgId);
    } catch (error) {
        console.error('[SupportPage] API failed:', error);
    }

    const stats = apiData?.stats || { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    const ticketListData = apiData?.ticketListProps || { tickets: [], total: 0 };

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
