import React from 'react';
import ProviderProductView from '@/src/components/features/ProviderProductView/ProviderProductView';
import { getProviderProductDetailData } from '@/src/lib/api/provider';
import { FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA } from '@/src/lib/api/mocks';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

interface Props {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: Props) {
    const { id } = params;
    const apiData: any = await getProviderProductDetailData(id);
    
    // We trust that if apiData is returned, it follows the mock strategy
    const product = apiData?.product || FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.product;
    
    return {
        title: `${product.name} | 0nbording`,
        description: `Managing setup and requests for ${product.name}.`,
    };
}

export default async function ProviderProductDetailPage({ params }: Props) {
    const { id } = params;
    
    // SSR Fetching
    const cookieStore = await cookies();
    const token = cookieStore.get('id_token')?.value;
    const sessionUser = await getSessionUser();
    const orgId = sessionUser?.org_id;

    try {
        const apiData: any = await getProviderProductDetailData(id, token, orgId);
        
        // Fallback to mock data handled by the aggregator, 
        // but we still need to extract it safely.
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
    } catch (error) {
        console.error('[ProviderProductDetailPage] Critical Error:', error);
        // Fallback to minimal mock view only if in dev/preview
        if (!token) {
            return (
                <ProviderProductView 
                    product={FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.product}
                    onboardingSteps={FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.onboardingSteps}
                    requirements={FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.requirements}
                    requests={FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.requests}
                />
            );
        }
        throw error; // Let Next.js show the error page
    }
}
