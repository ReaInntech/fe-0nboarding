import React from 'react';
import UnifiedBilling from '@/src/components/features/UnifiedBilling/UnifiedBilling';
import { getBillingInit } from '@/src/lib/api/payments';
import { Transaction, PaymentMethod } from '@/src/lib/api/types';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';

interface BrandedBillingPageProps {
  params: Promise<{
    providerSlug: string;
  }>;
}

export default async function BrandedBillingPage({ params }: BrandedBillingPageProps) {
  const { providerSlug } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get('id_token')?.value;
  const sessionUser = await getSessionUser();
  const orgId = sessionUser?.org_id || '222ef029-0639-4838-8379-334a17d5ef14';

  let transactions: Transaction[] = [];
  let methods: PaymentMethod[] = [];

  if (token && orgId) {
    try {
      const data = await getBillingInit(token, orgId);
      transactions = data.transactions || [];
      methods = data.methods || [];
    } catch (error) {
      console.error(`[BrandedBillingPage] API failed for provider "${providerSlug}":`, error);
    }
  }

  return (
    <UnifiedBilling
      transactions={transactions}
      methods={methods}
    />
  );
}
