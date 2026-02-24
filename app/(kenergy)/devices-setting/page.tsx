'use client';

import { useState, useEffect } from 'react';
import { useSite } from '@/lib/SiteContext';
import { useLocale } from '@/lib/LocaleContext';
import { ChevronDown, Search, Edit2, Trash2, Settings } from 'lucide-react';

interface Device {
  deviceID?: number;
  deviceName?: string;
  name?: string;
  ksaveID?: string;
  type?: string;
  owner?: string;
  U_email?: string;
  connection?: 'ONLINE' | 'OFFLINE';
  ipAddress?: string;
  lastUpdate?: string;
  timeSinceUpdate?: string;
  registerDate?: string;
  created_at?: string;
}

export default function DevicesSettingPage() {
  const { selectedSite } = useSite();
  const { t } = useLocale();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchCriteria, setSearchCriteria] = useState('');
  const [searchDeviceName, setSearchDeviceName] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Fetch devices from API
  useEffect(() => {
    fetchDevices();
  }, [selectedSite]);

  async function fetchDevices() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/kenergy/devices-setting?site=${selectedSite}`);
      const data = await response.json();

      if (data.success) {
        setDevices(data.devices || []);
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

  // Filter devices by table search
  const filteredDevices = devices.filter(device =>
    (device.deviceName || device.name || '').toLowerCase().includes(searchDeviceName.toLowerCase()) ||
    (device.ksaveID || '').toLowerCase().includes(searchDeviceName.toLowerCase()) ||
    (device.owner || device.U_email || '').toLowerCase().includes(searchDeviceName.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        {t('deviceConfiguration')}
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* All Roles Dropdown */}
          <div className="relative">
            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2 min-w-[140px]">
              {t('allRoles')}
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Device Name Dropdown */}
          <div className="relative">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2 min-w-[140px]">
              {t('deviceName')}
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Search Criteria */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchCriteria}
              onChange={(e) => setSearchCriteria(e.target.value)}
              placeholder={t('searchCriteria')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Search Button */}
          <button className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium transition-colors">
            {t('search')}
          </button>
        </div>
      </div>

      {/* Device List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('deviceList')}
          </h2>
        </div>

        <div className="p-6">
          {/* Entries selector and search */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{t('search')}:</span>
              <input
                type="text"
                value={searchDeviceName}
                onChange={(e) => setSearchDeviceName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-48"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-gray-600">Loading devices...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchDevices}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Retry
                </button>
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No devices found
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('no')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('actions')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('name')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('ksaveID') || 'Ksave ID'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('owner')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('connection')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('ipAddress') || 'IP Address'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('lastUpdate')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('timeSinceUpdate')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t('registerDate')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((device, index) => (
                    <tr key={device.deviceID} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit device">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete device">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-white border-2 border-blue-500 text-blue-600 rounded-md text-sm font-medium">
                          {device.deviceName || device.name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {device.ksaveID || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {device.owner || device.U_email || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-md text-sm font-medium ${
                          device.connection === 'ONLINE'
                            ? 'bg-green-100 text-green-700 border border-green-400'
                            : 'bg-red-100 text-red-700 border border-red-400'
                        }`}>
                          {device.connection || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {device.ipAddress || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {device.lastUpdate || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${
                          device.connection === 'ONLINE' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {device.timeSinceUpdate || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {device.registerDate || device.created_at || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              {t('showing')} {filteredDevices.length > 0 ? 1 : 0} {t('to')} {filteredDevices.length} {t('of')} {filteredDevices.length} {t('entries')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
