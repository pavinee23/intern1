'use client';

import { useState } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { ChevronDown, Search, Trash2, Users, FolderOpen } from 'lucide-react';

interface Project {
  no: number;
  projectName: string;
  owner: string;
  viewer: number;
  contentFolder: string;
  registerDate: string;
  lastUpdate: string;
  status: string;
  devices: number;
  tables: number;
}

// Mock project data
const projectsData: Project[] = [
  {
    no: 1,
    projectName: 'PTT',
    owner: 'info@kenergy-save.com',
    viewer: 0,
    contentFolder: 'customtemplate-bg',
    registerDate: '2026-01-14 17:17:06',
    lastUpdate: '2026-02-04 15:51:54',
    status: 'Enable',
    devices: 1,
    tables: 1
  }
];

export default function DashboardSettingPage() {
  const { t } = useLocale();
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [projectNameFilter, setProjectNameFilter] = useState('all');
  const [searchCriteria, setSearchCriteria] = useState('');
  const [searchText, setSearchText] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        {t('projectManagement')}
      </h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Owner Dropdown */}
          <div className="relative">
            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2 min-w-[140px]">
              {t('owner')}
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Project Name Dropdown */}
          <div className="relative">
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2 min-w-[200px]">
              100% English Project Name
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

          {/* Add New Button */}
          <button className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition-colors">
            {t('addNew')}
          </button>
        </div>
      </div>

      {/* Project List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('projectList')}
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
                    {t('projectName')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('owner')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('viewer')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('contentFolder')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('registerDate')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('lastUpdate')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('status')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('devices')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('tables')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectsData.map((project) => (
                  <tr key={project.no} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {project.no}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm font-medium">
                        {project.projectName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {project.owner}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                        <Users className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-cyan-50 border border-cyan-300 text-cyan-700 rounded text-sm">
                        {project.contentFolder}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {project.registerDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {project.lastUpdate}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded text-sm font-medium">
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded text-sm font-medium">
                        {project.devices}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded text-sm font-medium">
                        {project.tables}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              {t('showing')} 1 {t('to')} 1 {t('of')} 1 {t('entry')}
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
