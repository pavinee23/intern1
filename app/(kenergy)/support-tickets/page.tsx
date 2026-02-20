'use client';

import { useState } from 'react';
import { useLocale } from '@/lib/LocaleContext';
import { Search, Download, Plus } from 'lucide-react';

interface Ticket {
  no: number;
  ticketId: string;
  subject: string;
  type: string;
  priority: string;
  status: string;
  created: string;
  lastUpdate: string;
  age: string;
}

// Mock ticket data
const ticketsData: Ticket[] = [
  {
    no: 1,
    ticketId: 'TKT-20260120-0001',
    subject: 'Request Quotation - Smart Power Meter 3 Phase Onli...',
    type: 'Request Quotation',
    priority: 'Normal',
    status: 'Closed',
    created: '20/01/2026 09:59',
    lastUpdate: '06/02/2026 19:43',
    age: '18d 2h'
  }
];

export default function SupportTicketsPage() {
  const { t } = useLocale();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [tableSearchText, setTableSearchText] = useState('');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {t('supportTickets')}
        </h1>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {t('newTicket')}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors appearance-none pr-10"
            >
              <option value="all">{t('allStatus')}</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={t('searchTickets')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Search Button */}
          <button className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium transition-colors">
            {t('search')}
          </button>

          {/* Clear Button */}
          <button className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors">
            {t('clear')}
          </button>
        </div>
      </div>

      {/* My Tickets */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('myTickets')}
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
                value={tableSearchText}
                onChange={(e) => setTableSearchText(e.target.value)}
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
                    {t('ticketId')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('subject')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('type')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('priority')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('status')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('created')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('lastUpdate')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    {t('age')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ticketsData.map((ticket) => (
                  <tr key={ticket.no} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {ticket.no}
                    </td>
                    <td className="px-4 py-3">
                      <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        {ticket.ticketId}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {ticket.subject}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded text-sm font-medium">
                        {ticket.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-300 rounded text-sm font-medium">
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${
                        ticket.status === 'Closed'
                          ? 'bg-gray-500 text-white'
                          : 'bg-green-100 text-green-700 border border-green-300'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {ticket.created}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {ticket.lastUpdate}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {ticket.age}
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
