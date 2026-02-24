"use client";

import { useState, useEffect } from "react";
import { Search, Maximize2, MapPin } from "lucide-react";
import { useSite } from "@/lib/SiteContext";
import { useLocale } from "@/lib/LocaleContext";
import MapWrapper, { Device } from "@/components/MapWrapper";

export default function LocationPage() {
  const { selectedSite } = useSite();
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [allDevicesCount, setAllDevicesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch devices from API
  useEffect(() => {
    fetchDevices();
  }, [selectedSite]);

  async function fetchDevices() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/kenergy/device-locations?site=${selectedSite}`);
      const data = await response.json();

      if (data.success) {
        setDevices(data.devices || []);
        setAllDevicesCount(data.totalDevices || 0);
      } else {
        setError(data.error || 'Failed to fetch devices');
      }
    } catch (err: any) {
      console.error('Fetch devices error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Filter devices by search query
  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const devicesWithLocation = devices.length;
  const devicesWithoutLocation = allDevicesCount - devicesWithLocation;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading devices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDevices}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800">{t('devicesLocation') || 'Devices Location'}</h1>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-sm text-gray-600">
              {devicesWithLocation} {t('devicesWithLocation') || 'devices with location'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-600">
              {devicesWithoutLocation} {t('withoutLocation') || 'without location'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchLocation') || 'Search location...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Fit All Button */}
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
            <Maximize2 className="w-4 h-4" />
            <span className="text-sm font-medium">{t('fitAll') || 'Fit All'}</span>
          </button>

          {/* Set Location Button */}
          <button className="flex items-center space-x-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-orange-600 transition">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">{t('setLocation') || 'Set Location'}</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
        <MapWrapper devices={filteredDevices} />
      </div>
    </div>
  );
}
