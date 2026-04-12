'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/src/context/AppContext';

export default function RootPage() {
  const { user, isLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    console.log('[RootPage] State change:', { isLoading, user: !!user });
    if (!isLoading) {
      if (user) {
        console.log('[RootPage] Redirecting to /dashboard...');
        router.push('/dashboard');
      } else {
        console.log('[RootPage] Redirecting to /login...');
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1523]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-zinc-400 font-medium animate-pulse">
          {isLoading ? 'Initializing session...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}
