'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { serverFetchSettings } from '@/app/actions/db';

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
      const settings = await serverFetchSettings();
      const nextAppName = settings.app_name || 'ComplianceTracker';
      const nextThreshold = Number(settings.expiry_threshold || 30);

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
