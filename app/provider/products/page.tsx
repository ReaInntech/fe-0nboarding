import { getProviderProductsInit } from '@/src/lib/api/provider';
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
    const token = cookieStore.get('session')?.value;
    const sessionUser = await getSessionUser();
    const orgId = sessionUser?.org_id;

    let products = [];

    if (token && orgId) {
        try {
            const data = await getProviderProductsInit(token, orgId);
            products = data.products;
        } catch (error) {
            console.error('[ProviderProductsPage] API fetch failed and no fallback allowed:', error);
        }
    }

    // Default to mock data if in preview/dev and no products
    if (!token && !products.length) {
        products = FALLBACK_PROVIDER_PRODUCTS_DATA.products;
    }

    return (
        <ProviderProducts
            initialProducts={products}
        />
    );
}
