'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSite } from '@/lib/SiteContext';
import { useLocale } from '@/lib/LocaleContext';
import DeviceCard from '@/components/DeviceCard';
import { ChevronDown, Plus, RefreshCw } from 'lucide-react';

interface Device {
  deviceID: string;
  deviceName: string;
  location: string;
  status: string;
  lastRecordTime: string | null;
  before_L1?: number;
  before_L2?: number;
  before_L3?: number;
}

export default function OverviewPage() {
  const router = useRouter();
  const { selectedSite } = useSite();
  const { t } = useLocale();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('all');

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/devices');
      const json = await res.json();

      if (json.success) {
        setDevices(json.devices || []);
        setError(null);
      } else {
        setError(json.error || 'Failed to load devices');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const deviceCount = devices.length;

  const handleEditDevice = (deviceId: string) => {
    router.push(`/devices-setting?device=${deviceId}`);
  };

  // Loading State
  if (loading && devices.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {t('devicesOverview')}
          </h1>
          <div className="flex gap-3">
            <button
              onClick={fetchDevices}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium text-gray-700">
                {t('refresh') || 'Refresh'}
              </span>
            </button>
            <button
              onClick={() => router.push('/devices-setting')}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">
                {t('addDevice') || 'Add Device'}
              </span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Filter Section */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium text-gray-600">
            {t('filterByRole')}:
          </span>
          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors min-w-[160px] justify-between"
              onClick={() => {
                // Filter functionality can be added here
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
      {devices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => {
            const isOnline = device.status === 'ON';
            return (
              <DeviceCard
                key={device.deviceID}
                deviceName={device.deviceName}
                isOnline={isOnline}
                voltageReadings={{
                  ll1: device.before_L1 != null ? Number(device.before_L1) : null,
                  ll2: device.before_L2 != null ? Number(device.before_L2) : null,
                  ll3: device.before_L3 != null ? Number(device.before_L3) : null,
                }}
                lastConnected={device.lastRecordTime ? new Date(device.lastRecordTime).toLocaleString() : '-'}
                onlineTime={isOnline && device.lastRecordTime ? calculateTimeAgo(device.lastRecordTime) : undefined}
                onEdit={() => handleEditDevice(device.deviceID)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            {t('noDevicesFound') || 'No devices found'}
          </p>
        </div>
      )}
    </div>
  );
}

// Helper function to calculate time ago
function calculateTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);

  const hours = diffHours % 24;
  const minutes = diffMins % 60;
  const seconds = diffSecs % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
