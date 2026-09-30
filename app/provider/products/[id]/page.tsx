import React from 'react';
import ProviderProductView from '@/src/components/features/ProviderProductView/ProviderProductView';
import { getProviderProductDetailData } from '@/src/lib/api/provider';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata({ params }: Props) {
    const { id } = await params;
    
    const cookieStore = await cookies();
    const token = cookieStore.get('id_token')?.value;
    const sessionUser = await getSessionUser();
    const orgId = sessionUser?.org_id || '8a6ceaa0-c2e0-4945-93eb-bb04b7a2a2a9';

    try {
        const apiData: any = await getProviderProductDetailData(id, token, orgId);
        const product = apiData?.product;
        return {
            title: `${product?.name || 'Product'} | 0nbording`,
            description: `Managing setup and requests for ${product?.name || 'product'}.`,
        };
    } catch {
        return {
            title: 'Product Details | 0nbording',
            description: 'Product details page.',
        };
    }
}

export default async function ProviderProductDetailPage({ params }: Props) {
    const { id } = await params;
    
    // SSR Fetching
    const cookieStore = await cookies();
    const token = cookieStore.get('id_token')?.value;
    const sessionUser = await getSessionUser();
    const orgId = sessionUser?.org_id || '8a6ceaa0-c2e0-4945-93eb-bb04b7a2a2a9';

    try {
        const apiData: any = await getProviderProductDetailData(id, token, orgId);
        
        // Extract data safely
        const product = apiData?.product;
        const onboardingSteps = apiData?.onboardingSteps || [];
        const metadata = apiData?.metadata || {};
        const requests = apiData?.requests || [];

        if (!product) {
            notFound();
        }

        return (
            <ProviderProductView 
                product={product}
                onboardingSteps={onboardingSteps}
                metadata={metadata}
                requests={requests}
            />
        );
    } catch (error: any) {
        console.error('[ProviderProductDetailPage] Error loading product:', error);
        notFound();
    }
}
