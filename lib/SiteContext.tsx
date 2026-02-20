"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Site = "thailand" | "korea";

interface SiteContextType {
  selectedSite: Site;
  setSelectedSite: (site: Site) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [selectedSite, setSelectedSite] = useState<Site>("thailand");

  return (
    <SiteContext.Provider value={{ selectedSite, setSelectedSite }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  return context ?? { selectedSite: 'thailand' as Site, setSelectedSite: () => {} };
}
