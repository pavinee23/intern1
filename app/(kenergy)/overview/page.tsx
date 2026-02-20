'use client';

import { useState } from 'react';
import { useSite } from '@/lib/SiteContext';
import { useLocale } from '@/lib/LocaleContext';
import DeviceCard from '@/components/DeviceCard';
import { ChevronDown } from 'lucide-react';

interface Device {
  id: string;
  name: string;
  isOnline: boolean;
  voltageReadings: {
    ll1: number | null;
    ll2: number | null;
    ll3: number | null;
  };
  lastConnected?: string;
  onlineTime?: string;
}

// Mock device data
const devicesData: { [key: string]: Device[] } = {
  thailand: [
    {
      id: '1',
      name: 'MSP-MV5-2606',
      isOnline: false,
      voltageReadings: {
        ll1: null,
        ll2: null,
        ll3: null,
      },
      lastConnected: '2026-02-02 10:53:57',
    },
    {
      id: '2',
      name: 'PTT KANCHANABURI',
      isOnline: true,
      voltageReadings: {
        ll1: 406.6,
        ll2: 401.3,
        ll3: 403.8,
      },
      onlineTime: '00:00:34 ago',
    },
    {
      id: '3',
      name: 'SUITE 39 ENTERTAINMENT',
      isOnline: false,
      voltageReadings: {
        ll1: null,
        ll2: null,
        ll3: null,
      },
      lastConnected: '2026-01-30 18:42:51',
    },
    {
      id: '4',
      name: 'CENTRAL WORLD BANGKOK',
      isOnline: true,
      voltageReadings: {
        ll1: 398.5,
        ll2: 402.1,
        ll3: 400.7,
      },
      onlineTime: '00:01:12 ago',
    },
  ],
  korea: [
    {
      id: '5',
      name: 'SEOUL TECH CENTER',
      isOnline: true,
      voltageReadings: {
        ll1: 220.4,
        ll2: 219.8,
        ll3: 221.2,
      },
      onlineTime: '00:00:15 ago',
    },
    {
      id: '6',
      name: 'BUSAN INDUSTRIAL PARK',
      isOnline: false,
      voltageReadings: {
        ll1: null,
        ll2: null,
        ll3: null,
      },
      lastConnected: '2026-02-13 15:22:10',
    },
  ],
};

export default function OverviewPage() {
  const { selectedSite } = useSite();
  const { t } = useLocale();
  const [selectedRole, setSelectedRole] = useState('all');

  const currentDevices = devicesData[selectedSite] || [];
  const deviceCount = currentDevices.length;

  const handleEditDevice = (deviceId: string) => {
    console.log('Edit device:', deviceId);
    // Add edit functionality here
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          {t('devicesOverview')}
        </h1>

        {/* Filter Section */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium text-gray-600">
            {t('filterByRole')}:
          </span>
          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors min-w-[160px] justify-between"
              onClick={() => {
                // Add dropdown functionality if needed
              }}
            >
              <span>{t('allDevices')}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-gray-500">
            ({deviceCount} {t('devices')})
          </span>
        </div>
      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentDevices.map((device) => (
          <DeviceCard
            key={device.id}
            deviceName={device.name}
            isOnline={device.isOnline}
            voltageReadings={device.voltageReadings}
            lastConnected={device.lastConnected}
            onlineTime={device.onlineTime}
            onEdit={() => handleEditDevice(device.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {currentDevices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t('noDevicesFound')}
          </p>
        </div>
      )}
    </div>
  );
}
