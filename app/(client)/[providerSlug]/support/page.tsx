import React from 'react';
import SupportCenter from '@/src/components/features/Support/SupportCenter';
import { getSupportData } from '@/src/lib/api/support';
import { getProviderBrandingByIdentifier } from '@/src/lib/api/provider';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';

interface BrandedSupportPageProps {
  params: Promise<{
    providerSlug: string;
  }>;
}

export default async function BrandedSupportPage({ params }: BrandedSupportPageProps) {
  const { providerSlug } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get('id_token')?.value;
  const sessionUser = await getSessionUser();
  const orgId = sessionUser?.org_id || '222ef029-0639-4838-8379-334a17d5ef14';

  let apiData: any = null;
  let branding: any = null;
  try {
    const [supportRes, brandingRes] = await Promise.all([
      getSupportData(token, orgId),
      getProviderBrandingByIdentifier(providerSlug),
    ]);
    apiData = supportRes;
    branding = brandingRes;
  } catch (error) {
    console.error(`[BrandedSupportPage] API failed for provider "${providerSlug}":`, error);
  }

  const stats = apiData?.stats || { open: 0, in_progress: 0, resolved: 0, closed: 0 };
  const ticketListData = apiData?.ticketListProps || { tickets: [], total: 0 };
  const providerName = branding?.name || 'Soporte';

  const headerProps = {
    title: `Centro de Soporte · ${providerName}`,
    subtitle: `¿Cómo podemos ayudarte hoy? Gestiona tus solicitudes con ${providerName}.`,
    badge: { text: "Soporte Dedicado", icon: "support_agent" },
    icon: "help",
    iconColor: "text-[#1978e5]",
    badgeText: "Soporte Dedicado",
    productId: "support"
  };

  return (
    <SupportCenter
      headerProps={headerProps}
      stats={stats}
      ticketListProps={{
        ...ticketListData,
        title: "Tickets Recientes"
      }}
    />
  );
}
