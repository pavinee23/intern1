"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Site = "thailand" | "korea" | "vietnam";

interface SiteContextType {
  selectedSite: Site;
  setSelectedSite: (site: Site) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [selectedSite, setSelectedSiteState] = useState<Site>("thailand");

  useEffect(() => {
    const saved = localStorage.getItem("selectedSite") as Site;
    const valid: Site[] = ["thailand", "korea", "vietnam"];
    if (saved && valid.includes(saved)) {
      setSelectedSiteState(saved);
    }
  }, []);

  const setSelectedSite = (site: Site) => {
    setSelectedSiteState(site);
    localStorage.setItem("selectedSite", site);
  };

  return (
    <SiteContext.Provider value={{ selectedSite, setSelectedSite }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  return context ?? { selectedSite: 'thailand' as Site, setSelectedSite: (_: Site) => {} };
}
