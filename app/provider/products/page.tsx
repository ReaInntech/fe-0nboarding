import React from 'react';
import ProviderProducts from '@/src/components/features/ProviderProducts/ProviderProducts';
import { getProviderProductsData, FALLBACK_PROVIDER_PRODUCTS_DATA } from '@/src/lib/api';

export const metadata = {
    title: 'Products List | Provider Portal',
    description: 'Manage your organization catalog and offerings.',
};

export default async function ProviderProductsPage() {
    // SSR Fetching
    const apiData = await getProviderProductsData();
    
    // Fallback to mock data if API fails or is not yet implemented
    const products = apiData?.products || FALLBACK_PROVIDER_PRODUCTS_DATA.products;

    return (
        <ProviderProducts 
            initialProducts={products} 
        />
    );
}
