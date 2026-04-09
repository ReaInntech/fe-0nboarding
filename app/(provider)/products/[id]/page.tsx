import React from 'react';
import ProviderProductView from '@/src/components/features/ProviderProductView/ProviderProductView';
import { getProviderProductDetailData, FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA } from '@/src/lib/api';
import { notFound } from 'next/navigation';

interface Props {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: Props) {
    const { id } = params;
    const apiData = await getProviderProductDetailData(id);
    const product = apiData?.product || FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.product;
    
    return {
        title: `${product.name} | Provider Portal`,
        description: `Managing setup and requests for ${product.name}.`,
    };
}

export default async function ProviderProductDetailPage({ params }: Props) {
    const { id } = params;
    
    // SSR Fetching
    const apiData = await getProviderProductDetailData(id);
    
    // Fallback to mock data if API fails or is not yet implemented
    const product = apiData?.product || FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.product;
    const onboardingSteps = apiData?.onboardingSteps || FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.onboardingSteps;
    const requirements = apiData?.requirements || FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.requirements;
    const requests = apiData?.requests || FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA.requests;

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
}
