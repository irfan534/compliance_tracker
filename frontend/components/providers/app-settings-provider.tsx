'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

interface AppSettingsContextValue {
  appName: string;
  expiryThreshold: number;
  refreshSettings: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextValue>({
  appName: 'ComplianceTracker',
  expiryThreshold: 30,
  refreshSettings: async () => undefined,
});

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [appName, setAppName] = useState('ComplianceTracker');
  const [expiryThreshold, setExpiryThreshold] = useState(30);

  const refreshSettings = async () => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setAppName('ComplianceTracker');
        setExpiryThreshold(30);
        return;
      }

      const { data, error } = await supabase.from('settings').select('key, value').in('key', ['app_name', 'expiry_threshold']);

      if (error) {
        throw error;
      }

      const nextAppName = data?.find((setting) => setting.key === 'app_name')?.value || 'ComplianceTracker';
      const nextThreshold = Number(data?.find((setting) => setting.key === 'expiry_threshold')?.value || 30);

      setAppName(nextAppName);
      setExpiryThreshold(Number.isFinite(nextThreshold) ? nextThreshold : 30);
    } catch {
      setAppName('ComplianceTracker');
      setExpiryThreshold(30);
    }
  };

  useEffect(() => {
    void refreshSettings();
  }, []);

  return (
    <AppSettingsContext.Provider
      value={{
        appName,
        expiryThreshold,
        refreshSettings,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}
