import { redirect } from 'next/navigation';

interface BrandedSupportPageProps {
  params: Promise<{
    providerSlug: string;
  }>;
}

export default async function BrandedSupportPage({ params }: BrandedSupportPageProps) {
  const { providerSlug } = await params;
  redirect(`/${providerSlug}/dashboard`);
}
