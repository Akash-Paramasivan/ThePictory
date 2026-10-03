import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getSiteSettings } from '../api/settings';

interface SiteSettingsContextValue {
  offersPageEnabled: boolean;
  homepageVideoUrl: string | null;
  loaded: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  offersPageEnabled: false,
  homepageVideoUrl: null,
  loaded: false,
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<SiteSettingsContextValue>({
    offersPageEnabled: false,
    homepageVideoUrl: null,
    loaded: false,
  });

  useEffect(() => {
    getSiteSettings()
      .then((s) => setValue({ offersPageEnabled: s.offersPageEnabled, homepageVideoUrl: s.homepageVideoUrl, loaded: true }))
      .catch(() => setValue({ offersPageEnabled: false, homepageVideoUrl: null, loaded: true }));
  }, []);

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettingsContextValue {
  return useContext(SiteSettingsContext);
}
