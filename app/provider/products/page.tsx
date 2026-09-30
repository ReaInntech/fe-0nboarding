import { getProviderProductsInit } from '@/src/lib/api/provider';
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
    const orgId = sessionUser?.org_id || '8a6ceaa0-c2e0-4945-93eb-bb04b7a2a2a9';

    let products = [];

    try {
        const data = await getProviderProductsInit(token || '', orgId);
        products = data.products || [];
    } catch (error) {
        console.error('[ProviderProductsPage] API fetch failed:', error);
    }

    return (
        <ProviderProducts
            initialProducts={products}
            userProfile={sessionUser}
        />
    );
}
