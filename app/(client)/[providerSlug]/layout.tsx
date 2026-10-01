import React from 'react';
import { getProviderBrandingByIdentifier } from '@/src/lib/api/provider';
import { getSubscriptions, getEffectiveProviders } from '@/src/lib/api/dashboard';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { BrandProvider } from '@/src/context/BrandContext';

interface BrandedLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    providerSlug: string;
  }>;
}

export async function generateMetadata({ params }: { params: Promise<{ providerSlug: string }> }) {
  const { providerSlug } = await params;
  const branding = await getProviderBrandingByIdentifier(providerSlug);

  if (!branding) {
    return {
      title: 'Portal de Clientes · 0nbording',
    };
  }

  return {
    title: `${branding.name} · Portal`,
    description: `Portal exclusivo para clientes de ${branding.name}.`,
    icons: branding.favicon_url ? [{ rel: 'icon', url: branding.favicon_url }] : undefined,
  };
}

export default async function BrandedLayout({ children, params }: BrandedLayoutProps) {
  const { providerSlug } = await params;

  // 1. Fetch provider branding tokens
  const branding = await getProviderBrandingByIdentifier(providerSlug);

  if (!branding) {
    console.warn(`[BrandedLayout] Provider not found for slug "${providerSlug}". Redirecting to /dashboard.`);
    redirect('/dashboard');
  }

  // 2. Fetch user's subscriptions to identify available providers for switcher
  const cookieStore = await cookies();
  const token = cookieStore.get('id_token')?.value;
  const sessionUser = await getSessionUser();
  const orgId = sessionUser?.org_id || '222ef029-0639-4838-8379-334a17d5ef14';

  let allSubs: any[] = [];
  if (token) {
    try {
      allSubs = await getSubscriptions(token, orgId);
    } catch (err) {
      console.error('[BrandedLayout] Failed to fetch subscriptions:', err);
    }
  }

  const { providers } = getEffectiveProviders(allSubs);

  return (
    <BrandProvider
      branding={branding}
      providerSlug={providerSlug}
      availableProviders={providers}
    >
      <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc] text-slate-900">
        {children}
      </div>
    </BrandProvider>
  );
}
