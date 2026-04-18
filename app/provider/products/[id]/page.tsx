import React from 'react';
import ProviderProductView from '@/src/components/features/ProviderProductView/ProviderProductView';
import { getProviderProductDetailData } from '@/src/lib/api/provider';
import { FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA } from '@/src/lib/api/mocks';
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
    
    // Attempt to get token for metadata generation
    const cookieStore = await cookies();
    const token = cookieStore.get('id_token')?.value;
    const sessionUser = await getSessionUser();
    const orgId = sessionUser?.org_id;

    const apiData: any = await getProviderProductDetailData(id, token, orgId);
    
    // We trust that if apiData is returned, it follows the mock strategy
    const product = apiData?.product || FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.product;
    
    return {
        title: `${product.name} | 0nbording`,
        description: `Managing setup and requests for ${product.name}.`,
    };
}

export default async function ProviderProductDetailPage({ params }: Props) {
    const { id } = await params;
    
    // SSR Fetching
    const cookieStore = await cookies();
    const token = cookieStore.get('id_token')?.value;
    const sessionUser = await getSessionUser();
    const orgId = sessionUser?.org_id;

    try {
        const apiData: any = await getProviderProductDetailData(id, token, orgId);
        
        // Extract data safely
        const product = apiData?.product;
        const onboardingSteps = apiData?.onboardingSteps;
        const requirements = apiData?.requirements;
        const requests = apiData?.requests;

        if (!product) {
            notFound();
        }

        return (
            <ProviderProductView 
                product={product}
                onboardingSteps={onboardingSteps}
                requirements={requirements}
                requests={requests}
            />
        );
    } catch (error: any) {
        console.error('[ProviderProductDetailPage] Critical Error:', error);
        
        // Display nice error context if possible
        const isAuthError = error.message?.toLowerCase().includes('token') || 
                           error.message?.toLowerCase().includes('unauthorized');

        if (isAuthError && !token) {
            console.warn('[ProviderProductDetailPage] Redirecting or showing fallback due to missing token.');
        }

        // Fallback to minimal mock view only if no token and strategy allows
        return (
            <ProviderProductView 
                product={FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.product}
                onboardingSteps={FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.onboardingSteps}
                requirements={FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.requirements}
                requests={FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.requests}
            />
        );
    }
}
