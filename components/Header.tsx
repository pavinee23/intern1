"use client";

import { Bell, RefreshCw, X, CheckCheck, AlertTriangle, Info, Zap, Globe, ChevronDown } from "lucide-react";
import { useLocale } from "@/lib/LocaleContext";
import { useSite } from "@/lib/SiteContext";
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
  const { locale, setLocale, t } = useLocale();
  const { selectedSite, setSelectedSite } = useSite();
  const [showSiteMenu, setShowSiteMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const siteMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const currentSite = siteConfig.find((s) => s.value === selectedSite) ?? siteConfig[0];
  const currentLang = languageConfig.find((l) => l.value === locale) ?? languageConfig[1];

  const [notifications, setNotifications] = useState([
    { id: 1, type: "alert", title: "Device Offline", message: "Device K-001 has gone offline", time: "2 min ago", read: false },
    { id: 2, type: "info", title: "Energy Report Ready", message: "Monthly energy report for January is ready", time: "15 min ago", read: false },
    { id: 3, type: "warning", title: "High Consumption", message: "Zone B exceeds threshold by 12%", time: "1 hr ago", read: false },
    { id: 4, type: "success", title: "Maintenance Complete", message: "Scheduled maintenance finished successfully", time: "3 hrs ago", read: true },
    { id: 5, type: "info", title: "New Firmware Available", message: "Firmware v2.3.1 is available for K-Series", time: "1 day ago", read: true },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: number) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (siteMenuRef.current && !siteMenuRef.current.contains(event.target as Node)) {
        setShowSiteMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
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
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                {siteConfig.map((site) => (
                  <button
                    key={site.value}
                    onClick={() => { setSelectedSite(site.value); setShowSiteMenu(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors ${
                      selectedSite === site.value ? "bg-orange-100 border-l-4 border-orange-500" : ""
                    }`}
                  >
                    <CountryFlag country={site.flagCode} size="md" />
                    <span className={`text-sm font-semibold flex-1 text-left ${
                      selectedSite === site.value ? "text-orange-700" : "text-gray-800"
                    }`}>{t(site.nameKey) || site.nameKey}</span>
                    {selectedSite === site.value && <span className="text-orange-600">✓</span>}
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
              <div className="absolute left-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
                {languageConfig.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => { setLocale(lang.value); setShowLangMenu(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                      locale === lang.value ? "bg-blue-50 border-l-4 border-blue-500" : ""
                    }`}
                  >
                    <CountryFlag country={lang.flagCode} size="sm" />
                    <span className={`text-sm font-medium ${
                      locale === lang.value ? "text-blue-700" : "text-gray-700"
                    }`}>{lang.label}</span>
                    {locale === lang.value && <span className="ml-auto text-blue-600">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 hover:bg-orange-50 rounded-lg transition-all duration-200 hover:shadow-sm relative group"
            >
              <Bell className={`w-5 h-5 transition-colors ${showNotifications ? "text-orange-600" : "text-gray-500 group-hover:text-orange-600"}`} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-gray-800">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition">
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setShowNotifications(false)} className="p-1 rounded hover:bg-gray-200 transition">
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => {
                    const iconMap = {
                      alert: <AlertTriangle className="w-4 h-4 text-red-500" />,
                      warning: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
                      info: <Info className="w-4 h-4 text-blue-500" />,
                      success: <Zap className="w-4 h-4 text-green-500" />,
                    } as Record<string, React.ReactNode>;
                    return (
                      <button
                        key={notif.id}
                        onClick={() => markRead(notif.id)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition border-b border-gray-100 last:border-0 ${
                          !notif.read ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">{iconMap[notif.type]}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${!notif.read ? "text-gray-900" : "text-gray-600"}`}>{notif.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{notif.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                        {!notif.read && <span className="mt-1 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>}
                      </button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t bg-gray-50">
                  <a href="/notifications" className="text-xs text-orange-600 hover:text-orange-800 font-medium transition">View all notifications →</a>
                </div>
              </div>
            )}
          </div>

          {/* Refresh */}
          <button className="p-2.5 hover:bg-orange-50 rounded-lg transition-all duration-200 hover:shadow-sm group">
            <RefreshCw className="w-5 h-5 text-gray-500 group-hover:text-orange-600 group-hover:rotate-180 transition-all duration-500" />
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-4 border-l">
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
