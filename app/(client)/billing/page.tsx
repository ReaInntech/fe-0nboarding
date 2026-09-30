import UnifiedBilling from '@/src/components/features/UnifiedBilling/UnifiedBilling';
import { getBillingInit } from '@/src/lib/api/payments';
import { Transaction, PaymentMethod } from '@/src/lib/api/types';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';

export const metadata = {
    title: 'Billing | 0nbording',
    description: 'Manage your payments and subscriptions.',
};

export default async function BillingPage() {
    // SSR Fetching with Auth Token
    const cookieStore = await cookies();
    const token = cookieStore.get('id_token')?.value;
    const sessionUser = await getSessionUser();
    
    // Use org_id from custom claims if available
    const orgId = sessionUser?.org_id;

    let transactions: Transaction[] = [];
    let methods: PaymentMethod[] = [];

    if (token && orgId) {
        try {
            const data = await getBillingInit(token, orgId);
            transactions = data.transactions || [];
            methods = data.methods || [];
        } catch (error) {
            console.error('[BillingPage] API failed:', error);
        }
    }

    return (
        <UnifiedBilling 
            transactions={transactions} 
            methods={methods} 
        />
    );
}
