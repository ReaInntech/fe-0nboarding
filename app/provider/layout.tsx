import React from 'react';
import ProviderTopNavigation from '@/src/components/shared/molecule/ProviderTopNavigation';
import Footer from '@/src/components/shared/molecule/Footer';

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {children}
    </div>
  );
}
