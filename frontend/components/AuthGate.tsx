'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

interface AuthGateProps {
  children: ReactNode;
  requireLogin?: boolean;
}

export default function AuthGate({ children, requireLogin = false }: AuthGateProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (requireLogin && !session) {
        router.replace('/login');
      } else {
        setReady(true);
      }
    });

    // Listen for auth state changes (sign-out, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (requireLogin && !session) {
          router.replace('/login');
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, requireLogin]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F7] px-6">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#D2D2D7] border-t-[#0071E3]" />
      </div>
    );
  }

  return <>{children}</>;
}
