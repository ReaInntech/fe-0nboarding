import ProviderSettings from '@/src/components/features/ProviderSettings';
import { getProviderSettings } from '@/src/lib/api/provider';
import { getMockStrategy } from '@/src/lib/api/config';
import { FALLBACK_PROVIDER_SETTINGS } from '@/src/lib/api/mocks';
import { getSessionUser } from '@/src/lib/firebase/auth-actions';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'Settings & White-Label | 0nbording Provider',
  description: 'Customize institutional branding, corporate profile, regional standards, and notification rules.',
};

export default async function ProviderSettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('id_token')?.value;
  const sessionUser = await getSessionUser();

  const orgId = sessionUser?.org_id || 'org-prov-1';
  const strategy = getMockStrategy();

  let settings = null;

  if (token && orgId) {
    try {
      settings = await getProviderSettings(token, orgId);
    } catch (error) {
      console.error('[ProviderSettingsPage] API failed:', error);
    }
  }

  // Fallback if needed
  if (!settings && (strategy === 'always' || (strategy === 'fallback' && (!token || process.env.NODE_ENV === 'development')))) {
    console.log(`[ProviderSettingsPage] Using fallback settings (Strategy: ${strategy})`);
    settings = FALLBACK_PROVIDER_SETTINGS as any;
  }

  return (
    <ProviderSettings
      initialSettings={settings || (FALLBACK_PROVIDER_SETTINGS as any)}
      orgId={orgId}
      token={token}
      userProfile={sessionUser}
    />
  );
}
