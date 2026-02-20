'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/LocaleContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { 
  Package, 
  Truck, 
  Factory, 
  Ship, 
  Wrench, 
  AlertTriangle, 
  Settings, 
  FlaskConical, 
  ClipboardCheck,
  BarChart3,
  PieChart,
  Activity,
  Workflow,
  Shield
} from 'lucide-react';

export default function ProductionDashboardPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const t = translations[locale];
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Department data
  const departments = [
    { id: 'all', name: locale === 'ko' ? '전체' : 'All', emoji: '🏭' },
    { id: 'electronics', name: locale === 'ko' ? '전자부품' : 'Electronics', emoji: '⚡' },
    { id: 'assembly', name: locale === 'ko' ? '조립' : 'Assembly', emoji: '🔧' },
    { id: 'quality', name: locale === 'ko' ? '품질관리' : 'Quality Control', emoji: '🔍' },
    { id: 'packaging', name: locale === 'ko' ? '포장' : 'Packaging', emoji: '📦' },
    { id: 'shipping', name: locale === 'ko' ? '배송' : 'Shipping', emoji: '🚛' }
  ];

  // Production data by department
  const departmentData = {
    all: {
      totalOrders: 342,
      inProduction: 89,
      readyToShip: 67,
      shipped: 186,
      qualityTests: 45,
      materialsNeeded: 23,
      efficiency: 92.5,
      dailyOutput: 156
    },
    electronics: {
      totalOrders: 78,
      inProduction: 18,
      readyToShip: 15,
      shipped: 45,
      qualityTests: 12,
      materialsNeeded: 5,
      efficiency: 88.2,
      dailyOutput: 35
    },
    assembly: {
      totalOrders: 86,
      inProduction: 22,
      readyToShip: 18,
      shipped: 46,
      qualityTests: 8,
      materialsNeeded: 6,
      efficiency: 94.1,
      dailyOutput: 42
    },
    quality: {
      totalOrders: 65,
      inProduction: 16,
      readyToShip: 12,
      shipped: 37,
      qualityTests: 15,
      materialsNeeded: 4,
      efficiency: 96.8,
      dailyOutput: 28
    },
    packaging: {
      totalOrders: 72,
      inProduction: 19,
      readyToShip: 14,
      shipped: 39,
      qualityTests: 6,
      materialsNeeded: 5,
      efficiency: 90.3,
      dailyOutput: 32
    },
    shipping: {
      totalOrders: 41,
      inProduction: 14,
      readyToShip: 8,
      shipped: 19,
      qualityTests: 4,
      materialsNeeded: 3,
      efficiency: 87.6,
      dailyOutput: 19
    }
  };

  // Get current stats based on selected department
  const stats = departmentData[selectedDepartment];

  const menuCards = [
    {
      icon: Package,
      title: t.pendingProductionOrdersByBranch,
      description: locale === 'ko' ? '각 지점별 생산 대기 중인 주문 목록' : 'Production orders pending for each branch',
      href: '/production/pending-orders',
      color: 'bg-blue-500',
      count: stats.inProduction
    },
    {
      icon: Truck,
      title: t.pendingShipmentOrdersByBranch,
      description: locale === 'ko' ? '각 지점별 배송 대기 중인 주문 목록' : 'Shipment orders pending for each branch',
      href: '/production/pending-shipments',
      color: 'bg-green-500',
      count: stats.readyToShip
    },
    {
      icon: Factory,
      title: t.productionUpdates,
      description: locale === 'ko' ? '생산 진행 상황 업데이트' : 'Update production progress',
      href: '/production/production-updates',
      color: 'bg-orange-500',
      count: null
    },
    {
      icon: Ship,
      title: t.shipmentUpdates,
      description: locale === 'ko' ? '배송 상태 업데이트' : 'Update shipment status',
      href: '/production/shipment-updates',
      color: 'bg-teal-500',
      count: null
    },
    {
      icon: Wrench,
      title: t.materialsAwaitingPurchase,
      description: locale === 'ko' ? '구매 대기 중인 필수 자재 목록' : 'Essential materials awaiting purchase',
      href: '/production/materials-list',
      color: 'bg-purple-500',
      count: 12
    },
    {
      icon: AlertTriangle,
      title: t.dailyIssuesReport,
      description: locale === 'ko' ? '매일 발견된 문제점 업데이트' : 'Daily discovered issues update',
      href: '/production/daily-issues',
      color: 'bg-red-500',
      count: 3
    },
    {
      icon: Settings,
      title: t.dailyDevelopmentFixes,
      description: locale === 'ko' ? '매일 개발 및 문제 해결 업데이트' : 'Daily development and fixes update',
      href: '/production/development-fixes',
      color: 'bg-indigo-500',
      count: null
    },
    {
      icon: FlaskConical,
      title: t.postProductionTestResults,
      description: locale === 'ko' ? '생산 후 기기 테스트 결과 업데이트' : 'Post-production device test results',
      href: '/production/test-results',
      color: 'bg-cyan-500',
      count: 15
    },
    {
      icon: ClipboardCheck,
      title: t.qualityControlReports,
      description: locale === 'ko' ? 'QA/QC 품질 검사 보고서' : 'QA/QC quality inspection reports',
      href: '/production/qa-reports',
      color: 'bg-emerald-500',
      count: 8
    },
    {
      icon: Workflow,
      title: t.flowSystem,
      description: t.flowSystemDesc,
      href: 'https://flow.team/signin.act',
      color: 'bg-cyan-600',
      count: null,
      external: true
    },
    {
      icon: Shield,
      title: t.adminSupport,
      description: t.adminSupportDesc,
      href: '/admin-support/production',
      color: 'bg-purple-500',
      count: null
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-orange-600 hover:text-orange-800"
              >
                ← {t.back}
              </button>
              <div className="border-l-2 border-gray-300 pl-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏭</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {t.productionLogisticsDashboard}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {t.productionDepartmentDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Department Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {locale === 'ko' ? '부서 선택' : 'Select Department'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.id)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedDepartment === dept.id
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                }`}
              >
                <div className="text-2xl mb-1">{dept.emoji}</div>
                <div className="text-sm font-medium">{dept.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalOrders}</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
              </div>
              <Package className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.inProduction}</p>
                <p className="text-3xl font-bold text-orange-600">{stats.inProduction}</p>
              </div>
              <Factory className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.readyToShip}</p>
                <p className="text-3xl font-bold text-green-600">{stats.readyToShip}</p>
              </div>
              <Truck className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.shipped}</p>
                <p className="text-3xl font-bold text-gray-800">{stats.shipped}</p>
              </div>
              <Ship className="w-12 h-12 text-teal-500" />
            </div>
          </div>
        </div>

        {/* Production Analytics Charts - Only show when 'All' is selected */}
        {selectedDepartment === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Production Performance Bar Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-500" />
                {locale === 'ko' ? '부서별 생산량 비교' : 'Production Comparison by Department'}
              </h3>
              <div className="space-y-4">
                {Object.entries(departmentData).slice(1).map(([deptId, data]) => {
                  const dept = departments.find(d => d.id === deptId);
                  const percentage = (data.dailyOutput / departmentData.all.dailyOutput) * 100;
                  return (
                    <div key={deptId} className="flex items-center gap-3">
                      <div className="w-16 text-sm font-medium flex items-center gap-1">
                        <span>{dept?.emoji}</span>
                        <span className="text-xs">{dept?.name}</span>
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-orange-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                          style={{ width: `${Math.max(percentage, 15)}%` }}
                        >
                          <span className="text-white text-xs font-bold">{data.dailyOutput}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Production Activity Comparison */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                {locale === 'ko' ? '활동 현황 비교' : 'Activity Status Comparison'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.inProduction}</div>
                  <div className="text-sm text-blue-600">{locale === 'ko' ? '생산중' : 'In Production'}</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.readyToShip}</div>
                  <div className="text-sm text-green-600">{locale === 'ko' ? '출하준비' : 'Ready to Ship'}</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.qualityTests}</div>
                  <div className="text-sm text-yellow-600">{locale === 'ko' ? '품질검사' : 'Quality Tests'}</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.materialsNeeded}</div>
                  <div className="text-sm text-red-600">{locale === 'ko' ? '자재필요' : 'Materials Needed'}</div>
                </div>
              </div>
            </div>

            {/* Production Efficiency Donut Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                {locale === 'ko' ? '부서별 효율성' : 'Department Efficiency'}
              </h3>
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                    {Object.entries(departmentData).slice(1).map(([deptId, data], index) => {
                      const dept = departments.find(d => d.id === deptId);
                      const colors = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];
                      const percentage = data.efficiency;
                      const strokeDasharray = `${percentage * 2.51} 251`;
                      const rotation = index * 72;
                      return (
                        <circle
                          key={deptId}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={colors[index]}
                          strokeWidth="8"
                          strokeDasharray={strokeDasharray}
                          strokeLinecap="round"
                          transform={`rotate(${rotation} 50 50)`}
                          opacity="0.8"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{stats.efficiency}%</div>
                      <div className="text-sm text-gray-600">{locale === 'ko' ? '평균 효율성' : 'Avg Efficiency'}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2">
                {Object.entries(departmentData).slice(1).map(([deptId, data], index) => {
                  const dept = departments.find(d => d.id === deptId);
                  const colors = ['bg-orange-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-red-500'];
                  return (
                    <div key={deptId} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                      <span className="text-sm flex-1">{dept?.name}: {data.efficiency}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Production Performance Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {locale === 'ko' ? '부서별 성과 요약' : 'Department Performance Summary'}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2">{locale === 'ko' ? '부서' : 'Department'}</th>
                      <th className="text-right py-3 px-2">{locale === 'ko' ? '일일 생산량' : 'Daily Output'}</th>
                      <th className="text-right py-3 px-2">{locale === 'ko' ? '효율성' : 'Efficiency'}</th>
                      <th className="text-right py-3 px-2">{locale === 'ko' ? '완료' : 'Shipped'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(departmentData).slice(1).map(([deptId, data]) => {
                      const dept = departments.find(d => d.id === deptId);
                      return (
                        <tr key={deptId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 flex items-center gap-2">
                            <span>{dept?.emoji}</span>
                            <span className="font-medium">{dept?.name}</span>
                          </td>
                          <td className="text-right py-3 px-2 font-medium">{data.dailyOutput}</td>
                          <td className="text-right py-3 px-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              data.efficiency >= 95 ? 'bg-green-100 text-green-600' :
                              data.efficiency >= 90 ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {data.efficiency}%
                            </span>
                          </td>
                          <td className="text-right py-3 px-2 text-gray-600">{data.shipped}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuCards.map((card, index) => {
            const Icon = card.icon;
            const isExternal = card.external;
            
            if (isExternal) {
              return (
                <a
                  key={index}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left group block"
                >
                  <div className="flex items-start gap-4">
                    <div className={`${card.color} w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                          {card.title}
                        </h3>
                        {card.count !== null && (
                          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">
                            {card.count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </a>
              );
            }
            
            return (
              <button
                key={index}
                onClick={() => router.push(card.href)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className={`${card.color} w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                        {card.title}
                      </h3>
                      {card.count !== null && (
                        <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">
                          {card.count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {card.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
