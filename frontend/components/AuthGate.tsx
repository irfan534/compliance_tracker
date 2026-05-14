'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredAuthToken, updateLastActivity } from '@/lib/auth';

export default function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (!getStoredAuthToken()) {
      router.replace('/login');
      return;
    }

    setReady(true);
    updateLastActivity();

    // Set up activity tracking
    const handleActivity = () => {
      updateLastActivity();
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Check for session expiry every minute
    const checkInterval = setInterval(() => {
      const token = getStoredAuthToken();
      if (!token) {
        setSessionExpired(true);
        router.replace('/login?expired=true');
      }
    }, 60 * 1000); // Check every minute

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      clearInterval(checkInterval);
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] px-6">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#D2D2D7] border-t-[#0071E3]" />
      </div>
    );
  }

  if (sessionExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] px-6">
        <div className="max-w-md rounded-2xl border border-[#FFD7A1] bg-[#FFF4E5] p-6 text-center">
          <p className="text-sm text-[#7A4500]">Session expired. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
