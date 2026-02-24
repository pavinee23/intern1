'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/LocaleContext'
import { useSite } from '@/lib/SiteContext'
import DeviceCard from '@/components/DeviceCard'
import {
  Activity,
  Zap,
  Wifi,
  WifiOff,
  TrendingUp,
  Eye,
  BarChart3,
  FileText,
  RefreshCw
} from 'lucide-react'

interface DashboardStats {
  totalDevices: number
  onlineDevices: number
  offlineDevices: number
  energySaved: number
}

interface RecentDevice {
  deviceID: string
  deviceName: string
  location: string
  isOnline: boolean
  lastUpdate: string
  voltageLL: number[]
}

interface DashboardData {
  stats: DashboardStats
  recentDevices: RecentDevice[]
}

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useLocale()
  const { selectedSite } = useSite()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/kenergy/dashboard-stats?site=${selectedSite}`)
      const json = await res.json()

      if (json.success) {
        setData(json.data)
        setError(null)
      } else {
        setError(json.error || 'Failed to load dashboard data')
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000)
    return () => clearInterval(interval)
  }, [selectedSite])

  if (loading && !data) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium mb-2">Error loading dashboard</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="k-btn k-btn-primary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  const stats = data?.stats || {
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    energySaved: 0
  }

  const recentDevices = data?.recentDevices || []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('dashboard') || 'Dashboard'}
          </h1>
          <p className="text-gray-600">
            {t('welcomeMessage') || 'Welcome to your energy management dashboard'}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Grid - 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Devices */}
        <div className="stat-card bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">
                {t('totalDevices') || 'Total Devices'}
              </p>
              <p className="text-3xl font-bold text-orange-900">
                {stats.totalDevices}
              </p>
            </div>
            <div className="p-3 bg-orange-500 rounded-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Online Devices */}
        <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">
                {t('onlineDevices') || 'Online Devices'}
              </p>
              <p className="text-3xl font-bold text-green-900">
                {stats.onlineDevices}
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <Wifi className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Offline Devices */}
        <div className="stat-card bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">
                {t('offlineDevices') || 'Offline Devices'}
              </p>
              <p className="text-3xl font-bold text-red-900">
                {stats.offlineDevices}
              </p>
            </div>
            <div className="p-3 bg-red-500 rounded-lg">
              <WifiOff className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Energy Saved This Month */}
        <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 mb-1">
                {t('energySaved') || 'Energy Saved This Month'}
              </p>
              <p className="text-3xl font-bold text-amber-900">
                {stats.energySaved.toLocaleString()}
              </p>
              <p className="text-xs text-amber-600 mt-1">kWh</p>
            </div>
            <div className="p-3 bg-amber-500 rounded-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {t('quickActions') || 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/overview')}
            className="k-btn flex items-center justify-center gap-3 p-4 bg-white hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-300 rounded-lg transition-all"
          >
            <Eye className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-gray-700">
              {t('viewAllDevices') || 'View All Devices'}
            </span>
          </button>

          <button
            onClick={() => router.push('/monitor')}
            className="k-btn flex items-center justify-center gap-3 p-4 bg-white hover:bg-amber-50 border-2 border-gray-200 hover:border-amber-300 rounded-lg transition-all"
          >
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-gray-700">
              {t('monitor') || 'Monitor'}
            </span>
          </button>

          <button
            onClick={() => router.push('/energy-dashboard')}
            className="k-btn flex items-center justify-center gap-3 p-4 bg-white hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-300 rounded-lg transition-all"
          >
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <span className="font-medium text-gray-700">
              {t('reports') || 'Energy Reports'}
            </span>
          </button>
        </div>
      </div>

      {/* Recent Devices */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {t('recentDevices') || 'Recent Devices'}
          </h2>
          <button
            onClick={() => router.push('/overview')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('viewAll') || 'View All'} →
          </button>
        </div>

        {recentDevices.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {t('noDevices') || 'No devices found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentDevices.map((device) => (
              <DeviceCard
                key={device.deviceID}
                deviceName={device.deviceName}
                isOnline={device.isOnline}
                voltageReadings={{
                  ll1: device.voltageLL[0] != null ? Number(device.voltageLL[0]) : null,
                  ll2: device.voltageLL[1] != null ? Number(device.voltageLL[1]) : null,
                  ll3: device.voltageLL[2] != null ? Number(device.voltageLL[2]) : null
                }}
                lastConnected={device.lastUpdate ? new Date(device.lastUpdate).toLocaleString() : '-'}
                onEdit={() => router.push(`/devices-setting?device=${device.deviceID}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
