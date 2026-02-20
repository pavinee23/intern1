'use client';

import { useState } from 'react';
import { useSite } from '@/lib/SiteContext';
import { useLocale } from '@/lib/LocaleContext';
import { ChevronDown, Search, Edit2 } from 'lucide-react';

interface DeviceNotification {
  no: number;
  name: string;
  type: string;
  owner: string;
  alarm: boolean;
  highActive: boolean;
  lowActive: boolean;
  message: boolean;
  email: boolean;
  output: boolean;
  lastUpdate: string;
}

// Mock device notification data
const devicesData: { [key: string]: DeviceNotification[] } = {
  thailand: [
    {
      no: 1,
      name: 'MSP-MV5-2606',
      type: 'Energy 3-Ph',
      owner: 'info@kenergy-save.com',
      alarm: true,
      highActive: false,
      lowActive: false,
      message: false,
      email: false,
      output: false,
      lastUpdate: '2026-02-02 10:53:57'
    },
    {
      no: 2,
      name: 'PTT Kanchanaburi',
      type: 'Energy 3-Ph',
      owner: 'info@kenergy-save.com',
      alarm: true,
      highActive: false,
      lowActive: false,
      message: false,
      email: false,
      output: true,
      lastUpdate: '2026-02-07 12:09:39'
    },
    {
      no: 3,
      name: 'Suite 39 Entertainment',
      type: 'Energy 3-Ph',
      owner: 'info@kenergy-save.com',
      alarm: true,
      highActive: false,
      lowActive: false,
      message: false,
      email: false,
      output: false,
      lastUpdate: '2026-01-30 18:42:51'
    }
  ],
  korea: [
    {
      no: 1,
      name: 'Seoul Tech Center',
      type: 'Energy 3-Ph',
      owner: 'info@zera-energy.com',
      alarm: true,
      highActive: false,
      lowActive: false,
      message: false,
      email: false,
      output: true,
      lastUpdate: '2026-02-14 09:30:00'
    }
  ]
};

export default function NotificationsPage() {
  const { selectedSite } = useSite();
  const { t } = useLocale();
  const [searchCriteria, setSearchCriteria] = useState('');
  const [searchText, setSearchText] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const currentDevices = devicesData[selectedSite] || [];

  const StatusBadge = ({ enabled }: { enabled: boolean }) => (
    <span className={`px-3 py-1 rounded text-xs font-medium ${
      enabled 
        ? 'bg-green-100 text-green-700 border border-green-300' 
        : 'bg-gray-100 text-gray-600 border border-gray-300'
    }`}>
      {enabled ? t('enabled') : t('disabled')}
    </span>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        {t('deviceNotifications')}
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
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-48"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
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
                    {t('type')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('owner')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('alarm')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('highActive')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('lowActive')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('message')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('email')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('output')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('lastUpdate')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentDevices.map((device) => (
                  <tr key={device.no} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {device.no}
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-white border-2 border-blue-500 text-blue-600 rounded-md text-sm font-medium">
                        {device.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-white border border-red-400 text-red-600 rounded-md text-sm">
                        {device.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {device.owner}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge enabled={device.alarm} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge enabled={device.highActive} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge enabled={device.lowActive} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge enabled={device.message} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge enabled={device.email} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge enabled={device.output} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {device.lastUpdate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              {t('showing')} 1 {t('to')} {currentDevices.length} {t('of')} {currentDevices.length} {t('entries')}
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                «
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                ‹
              </button>
              <button className="px-3 py-1 bg-primary text-white rounded text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                ›
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
