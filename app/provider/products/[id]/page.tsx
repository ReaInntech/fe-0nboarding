import React from 'react';
import ProviderProductView from '@/src/components/features/ProviderProductView/ProviderProductView';
import { getProviderProductDetailData } from '@/src/lib/api/provider';
import { getMockStrategy } from '@/src/lib/api/config';
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
    const strategy = getMockStrategy();
    
    // Fallback logic respecting strategy
    let product = apiData?.product;
    if (!product && (strategy === 'always' || strategy === 'fallback')) {
        product = FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.product;
    }
    
    return {
        title: `${product?.name || 'Product'} | 0nbording`,
        description: `Managing setup and requests for ${product?.name || 'product'}.`,
    };
}

export default async function ProviderProductDetailPage({ params }: Props) {
    const { id } = await params;
    
    // SSR Fetching
    const cookieStore = await cookies();
    const token = cookieStore.get('id_token')?.value;
    const sessionUser = await getSessionUser();
    const orgId = sessionUser?.org_id;
    const strategy = getMockStrategy();

    try {
        const apiData: any = await getProviderProductDetailData(id, token, orgId);
        
        // Extract data safely
        const product = apiData?.product;
        const onboardingSteps = apiData?.onboardingSteps;
        const metadata = apiData?.metadata;
        const requests = apiData?.requests;

        if (!product) {
            // Even if product is missing, if strategy is always/fallback, we might want to show mocks
            // But usually detail pages should 404 if not found in API unless strategy is ALWAYS
            if (strategy === 'always') {
                return (
                    <ProviderProductView 
                        product={FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.product}
                        onboardingSteps={FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.onboardingSteps}
                        metadata={{}}
                        requests={FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.requests}
                    />
                );
            }
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
        console.error('[ProviderProductDetailPage] Critical Error:', error);
        
        // Fallback to mock view only if strategy allows
        if (strategy === 'always' || strategy === 'fallback') {
            return (
                <ProviderProductView 
                    product={FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.product}
                    onboardingSteps={FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.onboardingSteps}
                    metadata={{}}
                    requests={FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.requests}
                />
            );
        }

        // Otherwise rethrow or show 404
        notFound();
    }
}
