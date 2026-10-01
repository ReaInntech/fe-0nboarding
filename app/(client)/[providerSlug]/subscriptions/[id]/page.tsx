import React from 'react';
import UnifiedProductView from '@/src/components/features/UnifiedProductView/UnifiedProductView';
import { getSubscriptionDetailInit } from '@/src/lib/api/subscriptions';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import TopNavigation from '@/src/components/shared/molecule/TopNavigation';
import Footer from '@/src/components/shared/molecule/Footer';
import Link from 'next/link';

interface BrandedSubscriptionPageProps {
  params: Promise<{
    providerSlug: string;
    id: string;
  }>;
}

export default async function BrandedSubscriptionPage({ params }: BrandedSubscriptionPageProps) {
  const { providerSlug, id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get('id_token')?.value;
  const sessionUser = await getSessionUser();
  const orgId = sessionUser?.org_id || '222ef029-0639-4838-8379-334a17d5ef14';

  let detailData: any = null;
  try {
    detailData = await getSubscriptionDetailInit(id, token || '', orgId);
  } catch (error) {
    console.error(`[BrandedSubscriptionPage] Failed to fetch subscription detail for ${id}:`, error);
  }

  // Validate that subscription exists
  if (!detailData) {
    return (
      <div className="pt-[64px] relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f5f6f8] text-slate-900 antialiased">
        <TopNavigation activeTab="Services" userProfile={sessionUser} />
        <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 lg:px-8 py-12 flex items-center justify-center">
          <div className="text-center bg-white border border-slate-200 p-8 rounded-2xl shadow-sm max-w-md w-full">
            <div className="size-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold mb-2 text-slate-900">Suscripción no encontrada</h1>
            <p className="text-sm text-slate-500 mb-6">
              La suscripción solicitada no existe o no cuentas con los permisos necesarios para visualizarla.
            </p>
            <Link
              href={`/${providerSlug}/dashboard`}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-sm"
            >
              Volver a mis Servicios
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Security check: ensure this subscription belongs to this provider
  const subProviderSlug = detailData.provider?.slug || detailData.product?.provider?.slug;
  if (subProviderSlug && subProviderSlug !== providerSlug) {
    console.warn(`[BrandedSubscriptionPage] Subscription ${id} does not belong to provider "${providerSlug}". Redirecting.`);
    redirect(`/${providerSlug}/dashboard`);
  }

  return (
    <UnifiedProductView
      {...detailData}
      userProfile={sessionUser}
    />
  );
}
