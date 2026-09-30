import ProviderSettings from '@/src/components/features/ProviderSettings';
import { getProviderSettings } from '@/src/lib/api/provider';
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

  const orgId = sessionUser?.org_id || '8a6ceaa0-c2e0-4945-93eb-bb04b7a2a2a9';

  const settings = await getProviderSettings(token, orgId);

  return (
    <ProviderSettings
      initialSettings={settings}
      orgId={orgId}
      token={token}
      userProfile={sessionUser}
    />
  );
}
