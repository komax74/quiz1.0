import React, { createContext, useContext } from 'react';
import { usePlatformSettings } from '../hooks/usePlatformSettings';

interface PlatformSettings {
  logo: string;
  logoHeight: number;
  platformName: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  homeIcon: string;
  homeIconHeight: number;
}

interface PlatformSettingsContextType {
  settings: PlatformSettings;
  updateSettings: (settings: Partial<PlatformSettings>) => Promise<void>;
  loading: boolean;
}

const PlatformSettingsContext = createContext<PlatformSettingsContextType | null>(null);

export function PlatformSettingsProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings, loading } = usePlatformSettings();

  return (
    <PlatformSettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </PlatformSettingsContext.Provider>
  );
}

export function usePlatformSettingsContext() {
  const context = useContext(PlatformSettingsContext);
  if (!context) {
    throw new Error('usePlatformSettingsContext must be used within a PlatformSettingsProvider');
  }
  return context;
}