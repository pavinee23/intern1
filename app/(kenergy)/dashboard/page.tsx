'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/LocaleContext'
import { useSite } from '@/lib/SiteContext'
import DeviceCard from '@/components/DeviceCard'
import {
  Activity, Zap, Wifi, WifiOff, RefreshCw, ArrowRight,
  TrendingUp, Server, CheckCircle2, XCircle, Leaf,
  BarChart2, Monitor, Settings, Bell, ChevronRight,
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
  const [nowStr, setNowStr] = useState('')

  useEffect(() => {
    const d = new Date()
    setNowStr(
      d.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    )
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/kenergy/dashboard-stats?site=${selectedSite}`)
      const json = await res.json()
      if (json.success) { setData(json.data); setError(null) }
      else setError(json.error || 'Failed to load dashboard data')
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 60000)
    return () => clearInterval(interval)
  }, [selectedSite])

  if (loading && !data) {
    return (
      <div className="p-5 space-y-5 animate-pulse">
        <div className="h-48 bg-gradient-to-r from-slate-200 to-slate-100 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white rounded-3xl shadow-sm border border-red-100 p-10 max-w-sm">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-gray-800 font-semibold mb-1">Failed to load dashboard</p>
          <p className="text-gray-400 text-sm mb-5">{error}</p>
          <button onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors text-sm">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    )
  }

  const stats = data?.stats || { totalDevices: 0, onlineDevices: 0, offlineDevices: 0, energySaved: 0 }
  const recentDevices = data?.recentDevices || []
  const onlineRate = stats.totalDevices > 0 ? Math.round((stats.onlineDevices / stats.totalDevices) * 100) : 0

  return (
    <div className="p-5 space-y-5 bg-gray-50 min-h-screen">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 shadow-xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-xl" />

        <div className="relative z-10 px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
              K Energy Save System
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {t('dashboard') || 'Dashboard'}
            </h1>
            <p className="text-emerald-100 text-sm">{nowStr}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {[
              { val: stats.totalDevices, label: 'Devices' },
              { val: `${onlineRate}%`, label: 'Online' },
              { val: stats.energySaved.toLocaleString(), label: 'kWh Saved' },
            ].map(kpi => (
              <div key={kpi.label} className="flex flex-col items-center bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 min-w-[88px] border border-white/20">
                <span className="text-2xl font-bold text-white leading-none">{kpi.val}</span>
                <span className="text-emerald-200 text-xs mt-1">{kpi.label}</span>
              </div>
            ))}
            <button onClick={fetchDashboardData} title="Refresh"
              className="p-3 bg-white/15 hover:bg-white/25 rounded-xl border border-white/20 transition-all">
              <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Devices */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-5 text-white group hover:shadow-xl transition-all">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute -right-1 -top-6 w-16 h-16 bg-white/5 rounded-full" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Server className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full">
              {t('total') || 'Total'}
            </span>
          </div>
          <p className="text-4xl font-black text-white leading-none mb-1">{stats.totalDevices}</p>
          <p className="text-blue-100 text-xs font-medium">{t('totalDevices') || 'Total Devices'}</p>
        </div>

        {/* Online */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg p-5 text-white group hover:shadow-xl transition-all">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-4xl font-black text-white leading-none mb-1">{stats.onlineDevices}</p>
          <p className="text-emerald-100 text-xs font-medium mb-3">{t('onlineDevices') || 'Online Devices'}</p>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${onlineRate}%` }} />
          </div>
          <p className="text-emerald-100 text-xs mt-1 text-right">{onlineRate}% online</p>
        </div>

        {/* Offline */}
        <div className={`relative overflow-hidden rounded-2xl shadow-lg p-5 text-white group hover:shadow-xl transition-all ${
          stats.offlineDevices > 0
            ? 'bg-gradient-to-br from-red-500 to-rose-600'
            : 'bg-gradient-to-br from-slate-400 to-slate-500'
        }`}>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <WifiOff className="w-5 h-5 text-white" />
            </div>
            {stats.offlineDevices > 0 && (
              <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full animate-pulse">
                ⚠ Alert
              </span>
            )}
          </div>
          <p className="text-4xl font-black text-white leading-none mb-1">{stats.offlineDevices}</p>
          <p className="text-red-100 text-xs font-medium">{t('offlineDevices') || 'Offline Devices'}</p>
          {stats.offlineDevices > 0 && (
            <p className="text-white/70 text-xs mt-2">{stats.offlineDevices} device{stats.offlineDevices > 1 ? 's' : ''} need attention</p>
          )}
        </div>

        {/* Energy Saved */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg p-5 text-white group hover:shadow-xl transition-all">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold bg-white/20 text-white px-2.5 py-1 rounded-full">
              kWh
            </span>
          </div>
          <p className="text-4xl font-black text-white leading-none mb-1">{stats.energySaved.toLocaleString()}</p>
          <p className="text-amber-100 text-xs font-medium mb-2">{t('energySaved') || 'Energy Saved'}</p>
          <div className="flex items-center gap-1.5">
            <Leaf className="w-3 h-3 text-white/70" />
            <span className="text-white/70 text-xs">~{(stats.energySaved * 0.5).toLocaleString()} kg CO₂</span>
          </div>
        </div>

      </div>

      {/* ── System Health + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* System Health */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" /> System Health
            </h2>
            <span className="text-xs text-gray-400">Auto-refresh every 60s</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-600 font-medium flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" /> Online Rate
                </span>
                <span className={`font-bold ${onlineRate >= 80 ? 'text-emerald-600' : onlineRate >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                  {onlineRate}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${onlineRate >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : onlineRate >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${onlineRate}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3">
                <div className="p-2 bg-emerald-100 rounded-lg"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
                <div>
                  <p className="text-xl font-bold text-emerald-700">{stats.onlineDevices}</p>
                  <p className="text-xs text-emerald-600">Online</p>
                </div>
              </div>
              <div className={`flex items-center gap-3 rounded-xl p-3 ${stats.offlineDevices > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                <div className={`p-2 rounded-lg ${stats.offlineDevices > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                  <XCircle className={`w-4 h-4 ${stats.offlineDevices > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold ${stats.offlineDevices > 0 ? 'text-red-600' : 'text-gray-500'}`}>{stats.offlineDevices}</p>
                  <p className={`text-xs ${stats.offlineDevices > 0 ? 'text-red-500' : 'text-gray-400'}`}>Offline</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full border border-green-100">
                <Leaf className="w-3.5 h-3.5" /> CO₂ ~{(stats.energySaved * 0.5).toLocaleString()} kg reduced
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full border border-amber-100">
                <Zap className="w-3.5 h-3.5" /> {stats.energySaved.toLocaleString()} kWh saved
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
            <ChevronRight className="w-4 h-4 text-gray-400" /> Quick Actions
          </h2>
          <div className="space-y-1.5">
            {[
              { icon: Monitor,  label: 'Live Monitor', desc: 'Real-time data',   href: '/monitor',    cls: 'text-blue-500 bg-blue-50 hover:bg-blue-100' },
              { icon: BarChart2,label: 'Analytics',    desc: 'Charts & Reports', href: '/analytics',  cls: 'text-purple-500 bg-purple-50 hover:bg-purple-100' },
              { icon: Server,   label: 'Devices',      desc: 'All devices',      href: '/overview',   cls: 'text-teal-500 bg-teal-50 hover:bg-teal-100' },
              { icon: Settings, label: 'Settings',     desc: 'System config',    href: '/settings',   cls: 'text-gray-500 bg-gray-50 hover:bg-gray-100' },
            ].map(item => (
              <button key={item.label} onClick={() => router.push(item.href)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all group text-left">
                <div className={`p-2 rounded-lg transition-colors ${item.cls}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Devices ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 bg-emerald-500 rounded-full" />
            <h2 className="text-base font-semibold text-gray-800">
              {t('recentDevices') || 'Recent Devices'}
            </h2>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full font-medium">
              {recentDevices.length}
            </span>
          </div>
          <button onClick={() => router.push('/overview')}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-all">
            {t('viewAll') || 'View All'} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-5">
          {recentDevices.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Server className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm font-medium">{t('noDevices') || 'No devices found'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentDevices.map((device) => (
                <DeviceCard key={device.deviceID}
                  deviceName={device.deviceName}
                  isOnline={device.isOnline}
                  voltageReadings={{
                    ll1: device.voltageLL[0] != null ? Number(device.voltageLL[0]) : null,
                    ll2: device.voltageLL[1] != null ? Number(device.voltageLL[1]) : null,
                    ll3: device.voltageLL[2] != null ? Number(device.voltageLL[2]) : null,
                  }}
                  lastConnected={device.lastUpdate ? new Date(device.lastUpdate).toLocaleString() : '-'}
                  onEdit={() => router.push(`/devices-setting?device=${device.deviceID}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}


