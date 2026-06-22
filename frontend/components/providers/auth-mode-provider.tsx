'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

interface AuthModeContextType {
  isLoggedIn: boolean;
  isGuest: boolean;
  loading: boolean;
}

const AuthModeContext = createContext<AuthModeContextType | undefined>(undefined);

export function AuthModeProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) {
        setIsLoggedIn(!!session);
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) {
          setIsLoggedIn(!!session);
        }
      },
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthModeContextType = {
    isLoggedIn,
    isGuest: !isLoggedIn,
    loading,
  };

  return (
    <AuthModeContext.Provider value={value}>
      {children}
    </AuthModeContext.Provider>
  );
}

export function useAuthMode(): AuthModeContextType {
  const context = useContext(AuthModeContext);
  if (context === undefined) {
    throw new Error('useAuthMode must be used within AuthModeProvider');
  }
  return context;
}
