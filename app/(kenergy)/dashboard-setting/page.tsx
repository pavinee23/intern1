'use client';

import { useState } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { ChevronDown, Search, Trash2, Users, FolderOpen, LayoutDashboard, Plus } from 'lucide-react';

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
  country?: string;
}

export default function DashboardSettingPage() {
  const { t } = useLocale();
  const [projects, setProjects] = useState<Project[]>([
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
      tables: 1,
      country: 'Thailand',
    },
    {
      no: 2,
      projectName: 'Zera',
      owner: 'info@zera-energy.com',
      viewer: 2,
      contentFolder: 'zera-folder',
      registerDate: '2026-01-20 10:00:00',
      lastUpdate: '2026-02-10 12:00:00',
      status: 'Enable',
      devices: 2,
      tables: 2,
      country: 'Korea',
    },
  ]);
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [projectNameFilter, setProjectNameFilter] = useState('all');
  const [searchCriteria, setSearchCriteria] = useState('');
  const [searchText, setSearchText] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  // Country options (mock)
  const countryOptions = [
    { label: 'All', value: 'all' },
    { label: 'Thailand', value: 'Thailand' },
    { label: 'Korea', value: 'Korea' },
  ];

  // Filter projects by selected country
  const filteredProjects = selectedCountry === 'all'
    ? projects
    : projects.filter((p) => p.country === selectedCountry);

  return (
    <div className="p-5 space-y-5 bg-gray-50 min-h-screen">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-700 shadow-xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard Settings
            </div>
            <h1 className="text-3xl font-black text-white mb-1">{t('projectManagement') || 'Project Management'}</h1>
            <p className="text-cyan-100 text-sm">Manage dashboard projects and viewer access</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
              <FolderOpen className="w-4 h-4 text-white/70 mb-1" />
              <span className="text-2xl font-black text-white leading-none">{projects.length}</span>
              <span className="text-cyan-100 text-xs mt-0.5">Projects</span>
            </div>
            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-teal-700 font-bold text-sm rounded-xl hover:bg-teal-50 transition-all shadow-md"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4" /> {t('addNew') || 'Add New'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Country Selector */}
          <div>
            <select
              className="px-4 py-2 border rounded-md bg-gray-100"
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
            >
              {countryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
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
          <button
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            {t('addNew')}
          </button>
        </div>
      </div>

      {/* Project List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
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
                {filteredProjects.map((project) => (
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
              {t('showing')} 1 {t('to')} {filteredProjects.length} {t('of')} {filteredProjects.length} {t('entry')}
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
      {/* Add New Modal (UI only) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 min-w-[320px] relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowAddModal(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">{t('addNew') || 'Add New Project'}</h2>
            <div className="space-y-3">
              <input className="w-full border rounded px-3 py-2" placeholder="Project Name" />
              <input className="w-full border rounded px-3 py-2" placeholder="Owner Email" />
              <input className="w-full border rounded px-3 py-2" placeholder="Content Folder" />
              {/* Add more fields as needed */}
              <button className="w-full bg-teal-600 text-white py-2 rounded font-bold mt-2" disabled>
                {t('save') || 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
