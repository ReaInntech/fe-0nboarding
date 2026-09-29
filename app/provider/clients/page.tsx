import ProviderClients from '@/src/components/features/ProviderClients';
import { getProviderClients } from '@/src/lib/api/provider';
import { getMockStrategy } from '@/src/lib/api/config';
import { FALLBACK_PROVIDER_CLIENTS_DATA } from '@/src/lib/api/mocks';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'Clients Directory | 0nbording Provider',
  description: 'Manage client organizations, onboarding progress, domain verifications, and bulk invitations.',
};

export default async function ProviderClientsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('id_token')?.value;
  const sessionUser = await getSessionUser();

  const orgId = sessionUser?.org_id || 'org-prov-1';
  const strategy = getMockStrategy();

  let clientsData = null;

  if (token && orgId) {
    try {
      clientsData = await getProviderClients(token, orgId);
    } catch (error) {
      console.error('[ProviderClientsPage] API call failed:', error);
    }
  }

  // Fallback if needed
  if (!clientsData && (strategy === 'always' || (strategy === 'fallback' && (!token || process.env.NODE_ENV === 'development')))) {
    console.log(`[ProviderClientsPage] Using fallback clients data (Strategy: ${strategy})`);
    clientsData = FALLBACK_PROVIDER_CLIENTS_DATA;
  }

  return (
    <ProviderClients
      initialClients={clientsData?.clients || FALLBACK_PROVIDER_CLIENTS_DATA.clients}
      initialMetrics={clientsData?.metrics || FALLBACK_PROVIDER_CLIENTS_DATA.metrics}
      orgId={orgId}
      token={token}
    />
  );
}
