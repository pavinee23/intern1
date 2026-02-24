"use client";

import { Search, Bell, RefreshCw, Globe, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useSite } from "@/lib/SiteContext";
import { useLocale } from "@/lib/LocaleContext";
import { useState, useRef, useEffect } from "react";
import CountryFlag from "./CountryFlag";

type Site = "thailand" | "korea" | "vietnam";
type Locale = "ko" | "en" | "th" | "cn" | "vn";

const siteConfig: { value: Site; flagCode: "TH" | "KR" | "VN"; nameKey: string }[] = [
  { value: "thailand", flagCode: "TH", nameKey: "thailand" },
  { value: "korea", flagCode: "KR", nameKey: "republicOfKorea" },
  { value: "vietnam", flagCode: "VN", nameKey: "vietnam" },
];

const languageConfig: { value: Locale; label: string; flagCode: "KR" | "GB" | "TH" | "CN" | "VN" }[] = [
  { value: "ko", label: "한국어", flagCode: "KR" },
  { value: "en", label: "English", flagCode: "GB" },
  { value: "th", label: "ไทย", flagCode: "TH" },
  { value: "cn", label: "中文", flagCode: "CN" },
  { value: "vn", label: "Tiếng Việt", flagCode: "VN" },
];

export default function Header() {
  const { selectedSite, setSelectedSite } = useSite();
  const { locale, setLocale, t } = useLocale();
  const [showSiteMenu, setShowSiteMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const siteMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const currentSite = siteConfig.find((s) => s.value === selectedSite) ?? siteConfig[0];
  const currentLang = languageConfig.find((l) => l.value === locale) ?? languageConfig[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (siteMenuRef.current && !siteMenuRef.current.contains(event.target as Node)) {
        setShowSiteMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
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

          {/* Site Selector */}
          <div className="relative" ref={siteMenuRef}>
            <button
              onClick={() => setShowSiteMenu(!showSiteMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border border-orange-200"
            >
              <CountryFlag country={currentSite.flagCode} size="md" />
              <span className="text-sm font-semibold text-orange-700">{t(currentSite.nameKey) || currentSite.nameKey}</span>
              <ChevronDown className="w-4 h-4 text-orange-600" />
            </button>

            {showSiteMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                {siteConfig.map((site) => (
                  <button
                    key={site.value}
                    onClick={() => {
                      setSelectedSite(site.value);
                      setShowSiteMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors ${
                      selectedSite === site.value ? "bg-orange-100 border-l-4 border-orange-500" : ""
                    }`}
                  >
                    <CountryFlag country={site.flagCode} size="md" />
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-semibold ${selectedSite === site.value ? "text-orange-700" : "text-gray-800"}`}>
                        {t(site.nameKey) || site.nameKey}
                      </p>
                    </div>
                    {selectedSite === site.value && <span className="text-orange-600 text-xl">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow border border-gray-200"
            >
              <Globe className="w-4 h-4 text-gray-600" />
              <CountryFlag country={currentLang.flagCode} size="sm" />
              <span className="text-sm font-medium text-gray-700">{currentLang.label}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showLangMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                {languageConfig.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => {
                      setLocale(lang.value);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                      locale === lang.value ? "bg-blue-50 border-l-4 border-blue-500" : ""
                    }`}
                  >
                    <CountryFlag country={lang.flagCode} size="sm" />
                    <span className={`text-sm font-medium ${locale === lang.value ? "text-blue-700" : "text-gray-700"}`}>
                      {lang.label}
                    </span>
                    {locale === lang.value && <span className="ml-auto text-blue-600 text-lg">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
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
