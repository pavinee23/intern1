"use client";

import { Search, Bell, RefreshCw, Globe, ChevronDown, ArrowLeftRight } from "lucide-react";
import Image from "next/image";
import { useSite } from "@/lib/SiteContext";
import { useLocale } from "@/lib/LocaleContext";
import { useState, useRef, useEffect } from "react";
import CountryFlag from "./CountryFlag";

export default function Header() {
  const { selectedSite, setSelectedSite } = useSite();
  const { locale, setLocale, t } = useLocale();
  const [showSiteMenu, setShowSiteMenu] = useState(false);
  const siteMenuRef = useRef<HTMLDivElement>(null);

  const siteDisplayName = selectedSite === "thailand" ? (t('thailand') || "Thailand") : (t('republicOfKorea') || "Republic of Korea");

  // Map locale to country for flag display (use ISO codes matching CountryFlag)
  const localeToCountry = {
    en: "GB" as const,
    ko: "KR" as const,
  };

  // Close site menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (siteMenuRef.current && !siteMenuRef.current.contains(event.target as Node)) {
        setShowSiteMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/AMqDpBqx0RHlW36D/kenergysave-logo-m6L2JxknygHwL0Bj.png"
              alt="K Energy Save Co., Ltd."
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Site Selector - Dropdown */}
          <div className="relative" ref={siteMenuRef}>
            <button
              onClick={() => setShowSiteMenu(!showSiteMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border border-orange-200"
            >
              <CountryFlag country={selectedSite === "thailand" ? "TH" : "KR"} size="md" />
              <span className="text-sm font-semibold text-orange-700">{siteDisplayName}</span>
              <ChevronDown className="w-4 h-4 text-orange-600" />
            </button>

            {/* Site Dropdown Menu */}
            {showSiteMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {[
                  { value: 'thailand', name: t('thailand') || 'Thailand', flag: 'TH' },
                  { value: 'korea', name: t('republicOfKorea') || 'Republic of Korea', flag: 'KR' }
                ].map((site) => (
                  <button
                    key={site.value}
                    onClick={() => {
                      setSelectedSite(site.value as 'thailand' | 'korea');
                      setShowSiteMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors ${
                      selectedSite === site.value ? "bg-orange-100 border-l-4 border-orange-500" : ""
                    }`}
                  >
                    <CountryFlag country={site.flag as 'TH' | 'KR'} size="md" />
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-semibold ${selectedSite === site.value ? 'text-orange-700' : 'text-gray-800'}`}>
                        {site.name}
                      </p>
                    </div>
                    {selectedSite === site.value && (
                      <span className="text-orange-600 text-xl">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Switcher - Simple Toggle */}
          <button
            onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow border border-gray-200"
            title={`Switch to ${locale === 'ko' ? 'English' : '한국어'}`}
          >
            <Globe className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {locale === 'ko' ? '한국어' : locale === 'th' ? 'ไทย' : 'English'}
            </span>
            <ArrowLeftRight className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <button className="p-2.5 hover:bg-orange-50 rounded-lg transition-all duration-200 hover:shadow-sm group">
            <Search className="w-5 h-5 text-gray-500 group-hover:text-orange-600 transition-colors" />
          </button>

          {/* Notifications */}
          <button className="p-2.5 hover:bg-orange-50 rounded-lg transition-all duration-200 hover:shadow-sm relative group">
            <Bell className="w-5 h-5 text-gray-500 group-hover:text-orange-600 transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white"></span>
          </button>

          {/* Refresh */}
          <button className="p-2.5 hover:bg-orange-50 rounded-lg transition-all duration-200 hover:shadow-sm group">
            <RefreshCw className="w-5 h-5 text-gray-500 group-hover:text-orange-600 group-hover:rotate-180 transition-all duration-500" />
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-4 border-l">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white">
              <Image
                src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/AMqDpBqx0RHlW36D/kenergysave-logo-m6L2JxknygHwL0Bj.png"
                alt="K Energy Save"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">K Energy Save Co., Ltd.</p>
              <p className="text-xs text-gray-600">info@kenergy-save.com</p>
              <p className="text-xs text-primary font-medium">group of Zera</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
