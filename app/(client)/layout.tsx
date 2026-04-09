import React from 'react';
import TopNavigation from '@/src/components/shared/molecule/TopNavigation';
import Footer from '@/src/components/shared/molecule/Footer';

export default function ClientLayout({
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
