'use client';

import { useState, useEffect } from 'react';
import { useSite } from '@/lib/SiteContext';
import { useLocale } from '@/lib/LocaleContext';
import { ChevronDown, Search, Edit2, Trash2, Settings, Server, Wifi, WifiOff, RefreshCw, X, Save, Phone, MapPin, User } from 'lucide-react';

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
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  location?: string;
  site?: string;
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
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [editForm, setEditForm] = useState<Partial<Device>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  function openEdit(device: Device) {
    setEditingDevice(device);
    setEditForm({
      deviceName: device.deviceName || device.name || '',
      owner: device.owner || device.U_email || '',
      ipAddress: device.ipAddress || '',
      customerName: device.customerName || '',
      customerPhone: device.customerPhone || '',
      customerAddress: device.customerAddress || '',
      location: device.location || '',
    });
    setSaveMsg(null);
  }

  async function saveEdit() {
    if (!editingDevice?.deviceID) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch('/api/kenergy/devices-setting', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: editingDevice.deviceID, ...editForm }),
      });
      const json = await res.json();
      if (json.success) {
        setSaveMsg('saved');
        setDevices(prev => prev.map(d =>
          d.deviceID === editingDevice.deviceID ? { ...d, ...editForm } : d
        ));
        setTimeout(() => setEditingDevice(null), 800);
      } else {
        setSaveMsg('error');
      }
    } catch {
      setSaveMsg('error');
    }
    setSaving(false);
  }

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

  const onlineCount = devices.filter(d => d.connection === 'ONLINE').length;

  return (
    <>
    <div className="p-3 md:p-5 space-y-4 md:space-y-5 bg-gradient-to-b from-slate-100 to-gray-50 min-h-screen">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-xl">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize:'24px 24px'}} />
        <div className="relative z-10 px-5 py-6 md:px-8 md:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3 ring-1 ring-white/20">
              <Settings className="w-3.5 h-3.5 text-blue-300" /> Device Settings
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1">{t('deviceConfiguration') || 'Device Configuration'}</h1>
            <p className="text-slate-300 text-sm">จัดการอุปกรณ์และข้อมูลลูกค้าทั้งหมด</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 self-stretch sm:self-auto">
            {[
              { icon: Server,  val: devices.length,                   label: 'ทั้งหมด', color: 'bg-white/15 border-white/10' },
              { icon: Wifi,    val: onlineCount,                       label: 'Online',  color: 'bg-emerald-500/20 border-emerald-400/20' },
              { icon: WifiOff, val: devices.length - onlineCount,      label: 'Offline', color: 'bg-red-500/20 border-red-400/20'  },
            ].map(kpi => (
              <div key={kpi.label} className={`flex flex-col items-center ${kpi.color} backdrop-blur-sm rounded-2xl px-4 py-3 min-w-[72px] border flex-1 sm:flex-none`}>
                <kpi.icon className="w-4 h-4 text-white/60 mb-1" />
                <span className="text-2xl font-black text-white leading-none">{kpi.val}</span>
                <span className="text-slate-300 text-xs mt-0.5">{kpi.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search + Refresh bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchDeviceName}
              onChange={e => setSearchDeviceName(e.target.value)}
              placeholder="ค้นหา ชื่อเครื่อง, KSAVE ID, ชื่อลูกค้า, Email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50"
            />
          </div>
          <button onClick={fetchDevices} disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition whitespace-nowrap">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            รีเฟรช
          </button>
        </div>
      </div>

      {/* Device List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
        <div className="px-4 py-4 md:px-6 md:py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-500" />
            {t('deviceList') || 'รายการอุปกรณ์'}
            <span className="ml-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{filteredDevices.length}</span>
          </h2>
        </div>

        <div className="p-3 md:p-4">
          {loading ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
              <p className="text-gray-500 text-sm">กำลังโหลดข้อมูล...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <WifiOff className="w-7 h-7 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <button onClick={fetchDevices} className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">ลองใหม่</button>
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-gray-400">
              <Server className="w-12 h-12 opacity-30" />
              <p className="text-sm">ไม่พบอุปกรณ์</p>
            </div>
          ) : (
            <>
              {/* ── Mobile cards (< md) ── */}
              <div className="md:hidden space-y-3">
                {filteredDevices.map((device, index) => (
                  <div key={device.deviceID} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg">
                          {device.deviceName || device.name || '-'}
                        </span>
                        <p className="text-xs text-gray-400 font-mono mt-1">{device.ksaveID || '-'}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                          device.connection === 'ONLINE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {device.connection === 'ONLINE' ? <Wifi className="w-3 h-3"/> : <WifiOff className="w-3 h-3"/>}
                          {device.connection || '-'}
                        </span>
                        <button onClick={() => openEdit(device)} className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow hover:bg-blue-700 transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {/* Customer info */}
                    {(device.customerName || device.customerPhone) && (
                      <div className="bg-blue-50 rounded-xl p-3 space-y-1.5">
                        {device.customerName && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                            <span className="font-semibold text-gray-800">{device.customerName}</span>
                          </div>
                        )}
                        {device.customerPhone && (
                          <a href={`tel:${device.customerPhone}`} className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:underline">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            {device.customerPhone}
                          </a>
                        )}
                        {device.customerAddress && (
                          <div className="flex items-start gap-2 text-xs text-gray-500">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-400" />
                            <span className="leading-snug">{device.customerAddress}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Device meta */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                        <p className="text-gray-400 mb-0.5">Email</p>
                        <p className="font-medium text-gray-700 truncate">{device.owner || device.U_email || '-'}</p>
                      </div>
                      <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                        <p className="text-gray-400 mb-0.5">IP Address</p>
                        <p className="font-medium text-gray-700 font-mono">{device.ipAddress || '-'}</p>
                      </div>
                      <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                        <p className="text-gray-400 mb-0.5">Last Update</p>
                        <p className={`font-semibold ${device.connection === 'ONLINE' ? 'text-emerald-600' : 'text-red-500'}`}>{device.timeSinceUpdate || '-'}</p>
                      </div>
                      <div className="bg-white rounded-xl p-2.5 border border-gray-100">
                        <p className="text-gray-400 mb-0.5">Register Date</p>
                        <p className="font-medium text-gray-700">{device.registerDate || device.created_at || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Desktop table (≥ md) ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                      {['#', 'แก้ไข', 'ชื่อเครื่อง', 'KSAVE ID', 'ชื่อลูกค้า', 'เบอร์โทร', 'ที่อยู่', 'Owner Email', 'สถานะ', 'IP Address', 'Last Update', 'ลงทะเบียน'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDevices.map((device, index) => (
                      <tr key={device.deviceID} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'}`}>
                        <td className="px-4 py-3.5 text-xs text-gray-400 font-mono">{index + 1}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex gap-1.5">
                            <button onClick={() => openEdit(device)} className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition shadow-sm" title="แก้ไข">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition shadow-sm" title="ลบ">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm">
                            {device.deviceName || device.name || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500 font-mono">{device.ksaveID || '-'}</td>
                        <td className="px-4 py-3.5">
                          {device.customerName
                            ? <span className="flex items-center gap-1.5 font-semibold text-gray-800"><User className="w-3.5 h-3.5 text-blue-400 flex-shrink-0"/>{device.customerName}</span>
                            : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          {device.customerPhone
                            ? <a href={`tel:${device.customerPhone}`} className="flex items-center gap-1.5 text-blue-600 font-semibold hover:underline">
                                <Phone className="w-3.5 h-3.5 flex-shrink-0"/>{device.customerPhone}
                              </a>
                            : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="px-4 py-3.5 max-w-[180px]">
                          {device.customerAddress
                            ? <span className="flex items-start gap-1.5 text-gray-600 text-xs">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5"/>
                                <span className="line-clamp-2">{device.customerAddress}</span>
                              </span>
                            : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500 max-w-[140px] truncate">{device.owner || device.U_email || '-'}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            device.connection === 'ONLINE'
                              ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                              : 'bg-red-100 text-red-600 ring-1 ring-red-200'
                          }`}>
                            {device.connection === 'ONLINE' ? <Wifi className="w-3 h-3"/> : <WifiOff className="w-3 h-3"/>}
                            {device.connection || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500 font-mono">{device.ipAddress || '-'}</td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs font-semibold ${device.connection === 'ONLINE' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {device.timeSinceUpdate || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-500">{device.registerDate || device.created_at || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination info */}
          {!loading && !error && filteredDevices.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
              แสดง {filteredDevices.length} รายการ จากทั้งหมด {devices.length} เครื่อง
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Edit Modal */}
      {editingDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs font-medium">ID: {editingDevice.deviceID}</p>
                <h2 className="text-white font-bold text-lg">{editForm.deviceName || editingDevice.deviceName}</h2>
              </div>
              <button onClick={() => setEditingDevice(null)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            {/* Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Customer info */}
              <div className="bg-blue-50/60 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> ข้อมูลลูกค้า
                </p>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อลูกค้า / Customer Name</label>
                  <input value={editForm.customerName ?? ''} onChange={e => setEditForm(f => ({...f, customerName: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="ชื่อ-นามสกุลลูกค้า" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">เบอร์โทร / Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input value={editForm.customerPhone ?? ''} onChange={e => setEditForm(f => ({...f, customerPhone: e.target.value}))}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="เช่น 02-123-4567 หรือ +66 81-234-5678" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ที่อยู่ / Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
                    <textarea rows={3} value={editForm.customerAddress ?? ''} onChange={e => setEditForm(f => ({...f, customerAddress: e.target.value}))}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      placeholder="ที่อยู่เต็ม เช่น บ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์" />
                  </div>
                </div>
              </div>
              {/* Device info */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">ข้อมูลอุปกรณ์</p>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อเครื่อง / Device Name</label>
                  <input value={editForm.deviceName ?? ''} onChange={e => setEditForm(f => ({...f, deviceName: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Device Name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email เจ้าของ / Owner Email</label>
                  <input value={editForm.owner ?? ''} onChange={e => setEditForm(f => ({...f, owner: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">สถานที่ / Location</label>
                  <input value={editForm.location ?? ''} onChange={e => setEditForm(f => ({...f, location: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Location" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">IP Address</label>
                  <input value={editForm.ipAddress ?? ''} onChange={e => setEditForm(f => ({...f, ipAddress: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="192.168.x.x" />
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-bold text-sm transition shadow-md">
                <Save className="w-4 h-4" />
                {saving ? 'กำลังบันทึก...' : saveMsg === 'saved' ? '✓ บันทึกแล้ว!' : 'บันทึก'}
              </button>
              <button onClick={() => setEditingDevice(null)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                ยกเลิก
              </button>
            </div>
            {saveMsg === 'error' && (
              <p className="px-6 pb-4 text-red-500 text-xs text-center">เกิดข้อผิดพลาด กรุณาลองใหม่</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
