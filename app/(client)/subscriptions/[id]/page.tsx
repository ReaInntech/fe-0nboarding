import React from 'react';
import UnifiedProductView from '@/src/components/features/UnifiedProductView/UnifiedProductView';
import { getSubscriptionDetailInit } from '@/src/lib/api/subscriptions';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Subscription Detail | 0nbording',
    description: 'View and manage your service subscription.',
};

interface SubscriptionPageProps {
    params: {
        id: string;
    };
}

export default async function SubscriptionPage({ params }: SubscriptionPageProps) {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('id_token')?.value;
    const sessionUser = await getSessionUser();
    const orgId = sessionUser?.org_id;

    if (!token || !orgId) {
        // In a real app, we might redirect to login if not in dev mode with mocks always on
        // For now, we'll try to fetch, which will trigger fallback if configured
    }

    let detailData: any = null;
    try {
        detailData = await getSubscriptionDetailInit(id, token || '', orgId || '');
    } catch (error) {
        console.error('[SubscriptionPage] Failed to fetch subscription detail:', error);
        // If it completely fails and no fallback, we might show an error
    }
    if (!detailData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Subscription Not Found</h1>
                    <p className="text-slate-400">The subscription you are looking for does not exist or you don't have access.</p>
                </div>
            </div>
        );
    }
    console.log('detailData', detailData);
    return (
        <UnifiedProductView
            {...detailData}
            userProfile={sessionUser}
        />
    );
}
