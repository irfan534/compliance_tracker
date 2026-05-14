'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredAuthToken } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getStoredAuthToken() ? '/dashboard' : '/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#D2D2D7] border-t-[#0071E3]" />
        <p className="text-sm text-[#6E6E73]">Preparing your workspace...</p>
      </div>
    </div>
  );
}
