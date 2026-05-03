import { getProviderProductsInit } from '@/src/lib/api/provider';
import { getMockStrategy } from '@/src/lib/api/config';
import { FALLBACK_PROVIDER_PRODUCTS_DATA } from '@/src/lib/api/mocks';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';
import ProviderProducts from '@/src/components/features/ProviderProducts/ProviderProducts';

export const metadata = {
    title: 'Products List | 0nbording',
    description: 'Manage your organization catalog and offerings.',
};

export default async function ProviderProductsPage() {
    // SSR Fetching with Auth Token
    const cookieStore = await cookies();
    const token = cookieStore.get('id_token')?.value;
    const sessionUser = await getSessionUser();
    const orgId = sessionUser?.org_id;
    const strategy = getMockStrategy();

    let products = [];

    if (token && orgId) {
        try {
            const data = await getProviderProductsInit(token, orgId);
            products = data.products;
        } catch (error) {
            console.error('[ProviderProductsPage] API fetch failed:', error);
        }
    }

    // Default to mock data only if strategy allows
    const hasNoData = !products.length;
    if (hasNoData && (strategy === 'always' || (strategy === 'fallback' && (!token || process.env.NODE_ENV === 'development')))) {
        console.log(`[ProviderProductsPage] Using fallback mock data (Strategy: ${strategy})`);
        products = FALLBACK_PROVIDER_PRODUCTS_DATA.products;
    }

    return (
        <ProviderProducts
            initialProducts={products}
        />
    );
}
