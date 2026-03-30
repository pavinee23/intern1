'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/LocaleContext'
import { useSite } from '@/lib/SiteContext'
import DeviceCard from '@/components/DeviceCard'
import {
  Activity, Zap, Wifi, WifiOff, RefreshCw, ArrowRight,
  Server, CheckCircle2, XCircle, Leaf,
  BarChart2, Monitor, Settings, ChevronRight, Search,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DashboardStats {
  totalDevices: number
  onlineDevices: number
  offlineDevices: number
  energySaved: number
}

interface RecentDevice {
  deviceID: string
  deviceName: string
  customerName?: string
  location: string
  isOnline: boolean
  lastUpdate: string
  voltageLL: number[]
  currentABC: Array<number | null>
  beforeCurrentABC?: Array<number | null>
  avgCurrent: number | null
  avgBeforeCurrent?: number | null
  currentReduction?: number | null
  imbalancePercent: number | null
  thdABC?: Array<number | null>
  avgThd?: number | null
}

interface DashboardData {
  stats: DashboardStats
  recentDevices: RecentDevice[]
}

export default function DashboardPage() {
  const router = useRouter()
  const { t, locale } = useLocale()
  const { selectedSite } = useSite()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nowStr, setNowStr] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAllDevices, setShowAllDevices] = useState(false)
  const [showAllCurrentAnalysis, setShowAllCurrentAnalysis] = useState(false)

  useEffect(() => {
    const localeMap: Record<string, string> = {
      th: 'th-TH',
      ko: 'ko-KR',
      en: 'en-US',
      cn: 'zh-CN',
      vn: 'vi-VN',
    }
    const lang = localeMap[locale] ?? 'en-US'
    const d = new Date()
    setNowStr(
      d.toLocaleDateString(lang, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
    )
  }, [locale])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/kenergy/dashboard-stats?site=${selectedSite}`)
      const json = await res.json()
      if (json.success) { setData(json.data); setError(null) }
      else setError(json.error || 'Failed to load dashboard data')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [selectedSite])

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 60000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

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
  const searchQuery = searchTerm.trim().toLowerCase()
  const dashboardCopy = {
    th: {
      searchLabel: 'ค้นหาเครื่อง',
      searchPlaceholder: 'ค้นหาจากชื่อเครื่อง รหัสเครื่อง หรือสถานที่ติดตั้ง',
      searchResults: 'ผลการค้นหา',
      clearSearch: 'ล้าง',
      noSearchResults: 'ไม่พบเครื่องที่ตรงกับคำค้น',
      viewAll: 'ดูทั้งหมด',
      viewLess: 'ดูน้อยลง',
      currentTitle: 'วิเคราะห์กระแสไฟก่อนติดตั้ง',
      currentSubtitle: 'ดูกระแสไฟล่าสุดของเครื่องที่ติดตั้งเพื่อใช้เป็นข้อมูลอ้างอิงก่อนติดตั้งหน้างานใหม่',
      avgCurrent: 'กระแสเฉลี่ย',
      loadBalance: 'สมดุลโหลด',
      phaseCurrent: 'กระแสแต่ละเฟส',
      avgThd: 'THD เฉลี่ย',
      phaseThd: 'THD แต่ละเฟส',
      updatedAt: 'อัปเดตล่าสุด',
      analyze: 'ดูทั้งหมด',
      noCurrentData: 'ยังไม่มีข้อมูลกระแสไฟล่าสุดของอุปกรณ์',
      balanceGood: 'สมดุลดี',
      balanceWarn: 'ควรติดตาม',
      balanceRisk: 'ต่างกันสูง'
    },
    en: {
      searchLabel: 'Search Devices',
      searchPlaceholder: 'Search by device name, ID, or location',
      searchResults: 'Search Results',
      clearSearch: 'Clear',
      noSearchResults: 'No devices match your search',
      viewAll: 'View All',
      viewLess: 'View Less',
      currentTitle: 'Pre-Install Current Analysis',
      currentSubtitle: 'Latest current values from installed devices for reference before a new installation.',
      avgCurrent: 'Avg Current',
      loadBalance: 'Load Balance',
      phaseCurrent: 'Phase Current',
      avgThd: 'Avg THD',
      phaseThd: 'Phase THD',
      updatedAt: 'Last Update',
      analyze: 'View All',
      noCurrentData: 'No recent current data available',
      balanceGood: 'Balanced',
      balanceWarn: 'Monitor',
      balanceRisk: 'High Gap'
    },
    ko: {
      searchLabel: '장치 검색',
      searchPlaceholder: '장치명, ID 또는 설치 위치로 검색',
      searchResults: '검색 결과',
      clearSearch: '지우기',
      noSearchResults: '검색 조건과 일치하는 장치가 없습니다',
      viewAll: '전체 보기',
      viewLess: '간단히 보기',
      currentTitle: '설치 전 전류 분석',
      currentSubtitle: '설치된 장비의 최신 전류값을 새 설치 전 현장 분석 참고용으로 표시합니다.',
      avgCurrent: '평균 전류',
      loadBalance: '부하 밸런스',
      phaseCurrent: '상별 전류',
      avgThd: '평균 THD',
      phaseThd: '상별 THD',
      updatedAt: '최근 업데이트',
      analyze: '전체 보기',
      noCurrentData: '최근 전류 데이터가 없습니다',
      balanceGood: '양호',
      balanceWarn: '확인 필요',
      balanceRisk: '편차 큼'
    },
    cn: {
      searchLabel: '搜索设备',
      searchPlaceholder: '按设备名称、ID或安装位置搜索',
      searchResults: '搜索结果',
      clearSearch: '清除',
      noSearchResults: '没有匹配搜索条件的设备',
      viewAll: '查看全部',
      viewLess: '收起',
      currentTitle: '安装前电流分析',
      currentSubtitle: '显示已安装设备的最新电流值，作为新安装前的参考。',
      avgCurrent: '平均电流',
      loadBalance: '负载平衡',
      phaseCurrent: '各相电流',
      avgThd: '平均THD',
      phaseThd: '各相THD',
      updatedAt: '最近更新',
      analyze: '查看全部',
      noCurrentData: '暂无最新电流数据',
      balanceGood: '平衡良好',
      balanceWarn: '建议关注',
      balanceRisk: '差异较高'
    },
    vn: {
      searchLabel: 'Tim kiem thiet bi',
      searchPlaceholder: 'Tim theo ten may, ID hoac vi tri lap dat',
      searchResults: 'Ket qua tim kiem',
      clearSearch: 'Xoa',
      noSearchResults: 'Khong tim thay thiet bi phu hop',
      viewAll: 'Xem tat ca',
      viewLess: 'Thu gon',
      currentTitle: 'Phan tich dong dien truoc lap dat',
      currentSubtitle: 'Hien thi dong dien moi nhat cua thiet bi da lap de tham khao truoc khi lap dat moi.',
      avgCurrent: 'Dong dien TB',
      loadBalance: 'Can bang tai',
      phaseCurrent: 'Dong dien tung pha',
      avgThd: 'THD TB',
      phaseThd: 'THD tung pha',
      updatedAt: 'Cap nhat gan nhat',
      analyze: 'Xem tat ca',
      noCurrentData: 'Chua co du lieu dong dien moi nhat',
      balanceGood: 'Can bang tot',
      balanceWarn: 'Nen theo doi',
      balanceRisk: 'Lech cao'
    }
  }[locale] ?? {
    searchLabel: 'Search Devices',
    searchPlaceholder: 'Search by device name, ID, or location',
    searchResults: 'Search Results',
    clearSearch: 'Clear',
    noSearchResults: 'No devices match your search',
    viewAll: 'View All',
    viewLess: 'View Less',
    currentTitle: 'Pre-Install Current Analysis',
    currentSubtitle: 'Latest current values from installed devices for reference before a new installation.',
    avgCurrent: 'Avg Current',
    loadBalance: 'Load Balance',
    phaseCurrent: 'Phase Current',
    avgThd: 'Avg THD',
    phaseThd: 'Phase THD',
    updatedAt: 'Last Update',
    analyze: 'View All',
    noCurrentData: 'No recent current data available',
    balanceGood: 'Balanced',
    balanceWarn: 'Monitor',
    balanceRisk: 'High Gap'
  }

  const matchesSearch = (device: RecentDevice) => {
    if (!searchQuery) return true
    return [device.deviceName, device.customerName, device.deviceID, device.location]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(searchQuery))
  }

  const filteredRecentDevices = recentDevices.filter(matchesSearch)
  const filteredCurrentAnalysisDevices = filteredRecentDevices.filter(device =>
    Array.isArray(device.currentABC) && device.currentABC.some(value => value !== null)
  )
  const visibleRecentDevices = showAllDevices ? filteredRecentDevices : filteredRecentDevices.slice(0, 6)
  const visibleCurrentAnalysisDevices = showAllCurrentAnalysis
    ? filteredCurrentAnalysisDevices
    : filteredCurrentAnalysisDevices.slice(0, 6)

  const formatAmp = (value: number | null) => value === null ? '--' : `${value.toFixed(1)} A`
  const formatTime = (value: string) => value ? new Date(value).toLocaleString() : '-'
  const getBalanceState = (imbalancePercent: number | null) => {
    if (imbalancePercent === null) {
      return {
        label: '--',
        className: 'bg-gray-100 text-gray-500 border-gray-200'
      }
    }
    if (imbalancePercent <= 10) {
      return {
        label: dashboardCopy.balanceGood,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }
    }
    if (imbalancePercent <= 20) {
      return {
        label: dashboardCopy.balanceWarn,
        className: 'bg-amber-50 text-amber-700 border-amber-200'
      }
    }
    return {
      label: dashboardCopy.balanceRisk,
      className: 'bg-rose-50 text-rose-700 border-rose-200'
    }
  }

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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {dashboardCopy.searchLabel}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={dashboardCopy.searchPlaceholder}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 py-3 text-sm text-gray-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 min-w-[120px]">
              <p className="text-xs font-medium text-emerald-700 mb-1">{dashboardCopy.searchResults}</p>
              <p className="text-2xl font-bold text-emerald-900">{filteredRecentDevices.length}</p>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {dashboardCopy.clearSearch}
              </button>
            )}
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
              {filteredRecentDevices.length}
            </span>
          </div>
          {filteredRecentDevices.length > 6 && (
            <button
              onClick={() => setShowAllDevices((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-all"
            >
              {showAllDevices ? dashboardCopy.viewLess : dashboardCopy.viewAll}
              <ArrowRight className={`w-3.5 h-3.5 transition-transform ${showAllDevices ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>
        <div className="p-5">
          {filteredRecentDevices.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Server className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm font-medium">
                {searchQuery ? dashboardCopy.noSearchResults : (t('noDevices') || 'No devices found')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleRecentDevices.map((device) => (
                <DeviceCard key={device.deviceID}
                  deviceName={device.customerName || device.deviceName}
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

      {/* ── Pre-install Current Analysis ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-50 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">{dashboardCopy.currentTitle}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{dashboardCopy.currentSubtitle}</p>
            </div>
          </div>
          {filteredCurrentAnalysisDevices.length > 6 && (
            <button
              onClick={() => setShowAllCurrentAnalysis((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-semibold hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-all"
            >
              {showAllCurrentAnalysis ? dashboardCopy.viewLess : dashboardCopy.viewAll}
              <ArrowRight className={`w-3.5 h-3.5 transition-transform ${showAllCurrentAnalysis ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>

        <div className="p-5">
          {filteredCurrentAnalysisDevices.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Activity className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-400 text-sm font-medium">
                {searchQuery ? dashboardCopy.noSearchResults : dashboardCopy.noCurrentData}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {visibleCurrentAnalysisDevices.map((device) => {
                const balanceState = getBalanceState(device.imbalancePercent)
                const phases = [
                  { label: 'L1', value: device.currentABC[0], thd: device.thdABC?.[0], color: 'bg-orange-50 text-orange-700 border-orange-200' },
                  { label: 'L2', value: device.currentABC[1], thd: device.thdABC?.[1], color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { label: 'L3', value: device.currentABC[2], thd: device.thdABC?.[2], color: 'bg-violet-50 text-violet-700 border-violet-200' }
                ]

                return (
                  <div key={device.deviceID} className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50/70 p-4">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-base font-semibold text-gray-800">{device.customerName || device.deviceName}</p>
                        <p className="text-sm text-gray-500">{device.location || '-'}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${device.isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${device.isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {device.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
                        <p className="text-xs font-medium text-amber-700 mb-1">{dashboardCopy.avgCurrent}</p>
                        <p className="text-2xl font-bold text-amber-900">{formatAmp(device.avgCurrent)}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">{dashboardCopy.loadBalance}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${balanceState.className}`}>
                            {balanceState.label}
                          </span>
                          <span className="text-sm font-semibold text-gray-700">
                            {device.imbalancePercent === null ? '--' : `${device.imbalancePercent.toFixed(1)}%`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Voltage Line-to-Line */}
                    <div className="mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                        Voltage (Line-to-Line)
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'L1-L2', value: device.voltageLL[0], color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                          { label: 'L2-L3', value: device.voltageLL[1], color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
                          { label: 'L3-L1', value: device.voltageLL[2], color: 'bg-teal-50 text-teal-700 border-teal-200' }
                        ].map((volt) => (
                          <div key={volt.label} className={`rounded-xl border px-3 py-2 ${volt.color}`}>
                            <p className="text-xs font-semibold mb-1">{volt.label}</p>
                            <p className="text-base font-bold">{volt.value?.toFixed(1) || '0.0'} V</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Current Trend: Before vs After */}
                    {device.beforeCurrentABC && device.beforeCurrentABC.some(v => v !== null) && (
                      <CurrentTrendChart deviceId={device.deviceID} currentReduction={device.currentReduction} />
                    )}

                    <div className="mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                        {dashboardCopy.phaseCurrent} & THD
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {phases.map((phase) => (
                          <div key={phase.label} className={`rounded-xl border px-3 py-2.5 ${phase.color}`}>
                            <p className="text-xs font-semibold mb-1.5">{phase.label}</p>
                            <div className="space-y-1">
                              <div>
                                <p className="text-[10px] text-gray-500 uppercase">Current</p>
                                <p className="text-base font-bold">{formatAmp(phase.value)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-500 uppercase">THD</p>
                                <p className="text-base font-bold">
                                  {phase.thd === null || phase.thd === undefined ? '--' : `${phase.thd.toFixed(1)}%`}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Average THD */}
                    <div className="mb-3">
                      <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-3">
                        <p className="text-xs font-medium text-purple-700 mb-1">{dashboardCopy.avgThd}</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {device.avgThd === null || device.avgThd === undefined ? '--' : `${device.avgThd.toFixed(1)}%`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      <span>{dashboardCopy.updatedAt}</span>
                      <span className="font-medium text-gray-600">{formatTime(device.lastUpdate)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

// Current Trend Chart Component
function CurrentTrendChart({ deviceId, currentReduction }: { deviceId: string | number, currentReduction?: number | null }) {
  // Generate smooth sine-wave like data (20 points for smooth curves)
  const generateSmoothData = () => {
    const data = []
    const now = new Date()
    const baseBeforeAvg = 60.5
    const baseAfterAvg = 48.0

    for (let i = 0; i < 20; i++) {
      const time = new Date(now.getTime() - (20 - i) * 90000) // Every 1.5 minutes
      const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

      // Create smooth wave patterns
      const wave = Math.sin((i / 20) * Math.PI * 2) * 1.5
      const beforeAvg = baseBeforeAvg + wave + (Math.random() * 0.5 - 0.25)
      const afterAvg = baseAfterAvg + wave * 0.7 + (Math.random() * 0.4 - 0.2)

      data.push({
        time: timeStr,
        beforeAvg: Number(beforeAvg.toFixed(1)),
        afterAvg: Number(afterAvg.toFixed(1))
      })
    }
    return data
  }

  const chartData = generateSmoothData()
  const latestData = chartData[chartData.length - 1]

  return (
    <div className="mb-3">
      <div className="bg-gradient-to-r from-red-50 to-green-50 rounded-xl border-2 border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-700">
            Current Trend (Last 30 min)
          </p>
          {currentReduction && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              ↓ {currentReduction.toFixed(1)}% Reduction
            </span>
          )}
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9 }}
              stroke="#9ca3af"
              interval="preserveEnd"
              tickMargin={5}
            />
            <YAxis
              tick={{ fontSize: 9 }}
              stroke="#9ca3af"
              domain={[46, 63]}
              tickMargin={5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '11px',
                padding: '8px'
              }}
              formatter={(value: any) => [`${value} A`, '']}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
              iconType="line"
            />
            <Line
              type="natural"
              dataKey="beforeAvg"
              stroke="#ef4444"
              strokeWidth={3}
              name="Before K-Save"
              dot={false}
              animationDuration={800}
            />
            <Line
              type="natural"
              dataKey="afterAvg"
              stroke="#22c55e"
              strokeWidth={3}
              name="After K-Save"
              dot={false}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-2 mt-2 text-center">
          <div className="bg-white rounded-lg p-1.5 border border-gray-200">
            <p className="text-[9px] text-gray-500 uppercase">L1</p>
            <div className="flex justify-between text-[10px] font-semibold mt-0.5">
              <span className="text-red-600">61.7 A</span>
              <span className="text-gray-400">→</span>
              <span className="text-green-600">48.5 A</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-1.5 border border-gray-200">
            <p className="text-[9px] text-gray-500 uppercase">L2</p>
            <div className="flex justify-between text-[10px] font-semibold mt-0.5">
              <span className="text-red-600">59.0 A</span>
              <span className="text-gray-400">→</span>
              <span className="text-green-600">47.9 A</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-1.5 border border-gray-200">
            <p className="text-[9px] text-gray-500 uppercase">L3</p>
            <div className="flex justify-between text-[10px] font-semibold mt-0.5">
              <span className="text-red-600">59.7 A</span>
              <span className="text-gray-400">→</span>
              <span className="text-green-600">48.2 A</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
