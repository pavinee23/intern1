'use client';

import { useState } from 'react';
import { useSite } from '@/lib/SiteContext';
import { useLocale } from '@/lib/LocaleContext';
import { ChevronDown, Search, Edit2, Trash2, Settings } from 'lucide-react';

interface Device {
  no: number;
  name: string;
  type: string;
  owner: string;
  connection: 'ONLINE' | 'OFFLINE';
  rssi: number;
  ramData: boolean;
  lastUpdate: string;
  timeSinceUpdate: string;
  registerDate: string;
}

// Mock device data
const devicesData: { [key: string]: Device[] } = {
  thailand: [
    {
      no: 1,
      name: 'MSP-MV5-2606',
      type: 'Energy 3-Ph',
      owner: 'info@kenergy-save.com',
      connection: 'OFFLINE',
      rssi: 0,
      ramData: true,
      lastUpdate: '2026-02-02 10:53:57',
      timeSinceUpdate: '121:16:40 hrs. ago',
      registerDate: '2025-08-25 09'
    },
    {
      no: 2,
      name: 'PTT Kanchanaburi',
      type: 'Energy 3-Ph',
      owner: 'info@kenergy-save.com',
      connection: 'ONLINE',
      rssi: 85,
      ramData: true,
      lastUpdate: '2026-07-12 10:19',
      timeSinceUpdate: '00:00:18 hrs. ago',
      registerDate: '2025-08-25 09'
    },
    {
      no: 3,
      name: 'Suite 39 Entertainment',
      type: 'Energy 3-Ph',
      owner: 'info@kenergy-save.com',
      connection: 'OFFLINE',
      rssi: 0,
      ramData: true,
      lastUpdate: '2026-01-30 18:42:51',
      timeSinceUpdate: '185:27:46 hrs. ago',
      registerDate: '2025-08-25 09'
    }
  ],
  korea: [
    {
      no: 1,
      name: 'Seoul Tech Center',
      type: 'Energy 3-Ph',
      owner: 'info@zera-energy.com',
      connection: 'ONLINE',
      rssi: 92,
      ramData: true,
      lastUpdate: '2026-02-14 09:30:00',
      timeSinceUpdate: '00:00:45 hrs. ago',
      registerDate: '2025-09-10 14'
    }
  ]
};

export default function DevicesSettingPage() {
  const { selectedSite } = useSite();
  const { t } = useLocale();
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchCriteria, setSearchCriteria] = useState('');
  const [searchDeviceName, setSearchDeviceName] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const currentDevices = devicesData[selectedSite] || [];

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
                    {t('connection')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('rssi')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('ramData')}
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
                {currentDevices.map((device) => (
                  <tr key={device.no} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {device.no}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                      <span className={`px-3 py-1 rounded-md text-sm font-medium ${
                        device.connection === 'ONLINE' 
                          ? 'bg-green-100 text-green-700 border border-green-400' 
                          : 'bg-red-100 text-red-700 border border-red-400'
                      }`}>
                        {device.connection}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                        <Settings className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                        <Settings className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {device.lastUpdate}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${
                        device.connection === 'ONLINE' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {device.timeSinceUpdate}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {device.registerDate}
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
