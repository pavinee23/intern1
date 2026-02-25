"use client";

import { Home, BarChart2, MapPin, Bell, Settings, Monitor, Layout as LayoutIcon, Code, Users, FileText, MessageSquare, HelpCircle, UserCircle, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/LocaleContext";

const navigationItems = [
  { key: "dashboard", icon: Home, href: "/dashboard" },
  { key: "overview", icon: BarChart2, href: "/overview" },
  { key: "monitor", icon: Monitor, href: "/monitor" },
  { key: "location", icon: MapPin, href: "/location" },
];

const configurationItems = [
  { key: "notifications", icon: Bell, href: "/notifications" },
  { key: "devicesSetting", icon: Settings, href: "/devices-setting" },
  { key: "dashboardSetting", icon: LayoutIcon, href: "/dashboard-setting" },
];

const developerItems = [
  { key: "developer", icon: Code, href: "/developer" },
];

const supportItems = [
  { key: "productsInfo", icon: FileText, href: "/products-info" },
  { key: "supportTickets", icon: MessageSquare, href: "/support-tickets" },
  { key: "userFeedback", icon: Users, href: "/user-feedback" },
  { key: "helpDocs", icon: HelpCircle, href: "/help-docs" },
  { key: "userProfile", icon: UserCircle, href: "/profile" },
];

export default function Sidebar() {
  const { t, locale } = useLocale();
  const pathname = usePathname();
  
  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex flex-col">
          <h2 className="font-bold text-gray-800">K Energy Save Co., Ltd.</h2>
          <p className="text-xs text-gray-500">Group of Zera</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">{t("navigation")}</h3>
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{t(item.key as any)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">{t("configurations")}</h3>
          <ul className="space-y-1">
            {configurationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{t(item.key as any)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">{t("developer")}</h3>
          <ul className="space-y-1">
            {developerItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{t(item.key as any)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">{t("userSupports")}</h3>
          <ul className="space-y-1">
            {supportItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{t(item.key as any)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Back to Main */}
      <div className="p-4 border-t">
        <Link
          href="/main-login"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-semibold">
            {locale === "th" ? "กลับหน้าหลัก" : locale === "ko" ? "메인으로 돌아가기" : "Back to Main"}
          </span>
        </Link>
      </div>
    </div>
  );
}
