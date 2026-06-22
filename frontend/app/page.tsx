'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F5F7] px-6">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#D2D2D7] border-t-[#0071E3]" />
    </main>
  );
}
