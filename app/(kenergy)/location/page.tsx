"use client";

import { useState } from "react";
import { Search, Maximize2, MapPin } from "lucide-react";
import { useSite } from "@/lib/SiteContext";
import { useLocale } from "@/lib/LocaleContext";
import MapWrapper, { Device } from "@/components/MapWrapper";

// Device data by site
const deviceData: Record<"thailand" | "korea", Device[]> = {
  thailand: [
    {
      id: 1,
      name: "Bangkok Office",
      lat: 13.7563,
      lng: 100.5018,
      status: "online" as const,
    },
    {
      id: 2,
      name: "Chiang Mai Branch",
      lat: 18.7883,
      lng: 98.9853,
      status: "online" as const,
    },
  ],
  korea: [
    {
      id: 1,
      name: "Seoul Headquarters",
      lat: 37.5665,
      lng: 126.9780,
      status: "online" as const,
    },
  ],
};

export default function LocationPage() {
  const { selectedSite } = useSite();
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");

  const devices = deviceData[selectedSite];
  const devicesWithLocation = devices.length;
  const devicesWithoutLocation = 1; // Mock data

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Devices Location</h1>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-sm text-gray-600">
              {devicesWithLocation} devices with location
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-600">
              {devicesWithoutLocation} without location
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Fit All Button */}
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
            <Maximize2 className="w-4 h-4" />
            <span className="text-sm font-medium">Fit All</span>
          </button>

          {/* Set Location Button */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-orange-600 transition">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Set Location</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
        <MapWrapper devices={devices} />
      </div>
    </div>
  );
}
