"use client"

import React, { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../components/AdminLayout'

type TrackRecord = {
  trackID: number; trackNo: string; orderID: number | null; orderNo: string | null
  orderDescription: string; supplierName: string; orderDate: string
  shippingMethod: string; trackingNumber: string; containerNo: string
  status: string; estimatedDeparture: string; actualDeparture: string
  estimatedArrival: string; actualArrival: string
  customsStatus: string; customsNotes: string; warehouseLocation: string
  itemsSummary: string; totalValue: number; notes: string
  created_by: string; created_at: string; updated_at: string
}

type PO = { orderID: number; orderNo: string; customer_name: string; priceTotal: number; status: string }

const emptyForm = {
  orderID: '', orderNo: '', orderDescription: '', supplierName: 'Korea HQ', orderDate: '',
  shippingMethod: 'sea', trackingNumber: '', containerNo: '', status: 'ordered',
  estimatedDeparture: '', actualDeparture: '', estimatedArrival: '', actualArrival: '',
  customsStatus: 'none', customsNotes: '', warehouseLocation: '',
  itemsSummary: '', totalValue: '', notes: ''
}

const statusFlow = ['ordered', 'confirmed', 'manufacturing', 'shipped', 'customs', 'arrived', 'delivered'] as const

const statusMap: Record<string, { en: string; th: string; color: string; bg: string }> = {
  ordered:       { en: 'Ordered',       th: 'สั่งซื้อแล้ว',      color: '#92400e', bg: '#fef3c7' },
  confirmed:     { en: 'Confirmed',     th: 'ยืนยันแล้ว',        color: '#1e40af', bg: '#dbeafe' },
  manufacturing: { en: 'Manufacturing', th: 'กำลังผลิต',         color: '#7c2d12', bg: '#ffedd5' },
  shipped:       { en: 'Shipped',       th: 'จัดส่งแล้ว',        color: '#155e75', bg: '#cffafe' },
  customs:       { en: 'Customs',       th: 'ตรวจศุลกากร',       color: '#581c87', bg: '#f3e8ff' },
  arrived:       { en: 'Arrived',       th: 'ถึงไทยแล้ว',        color: '#065f46', bg: '#d1fae5' },
  delivered:     { en: 'Delivered',     th: 'จัดส่งสำเร็จ',      color: '#14532d', bg: '#bbf7d0' },
  cancelled:     { en: 'Cancelled',     th: 'ยกเลิก',            color: '#991b1b', bg: '#fee2e2' },
}

const shippingIcons: Record<string, string> = { sea: '🚢', air: '✈️', land: '🚛', ems: '📦' }
const shippingLabels: Record<string, { en: string; th: string }> = {
  sea: { en: 'Sea Freight', th: 'ทางเรือ' }, air: { en: 'Air Freight', th: 'ทางอากาศ' },
  land: { en: 'Land Transport', th: 'ทางบก' }, ems: { en: 'EMS/Parcel', th: 'พัสดุ/EMS' }
}

const customsLabels: Record<string, { en: string; th: string }> = {
  none: { en: 'N/A', th: 'ไม่มี' }, pending: { en: 'Pending', th: 'รอตรวจ' },
  inspecting: { en: 'Inspecting', th: 'กำลังตรวจ' }, cleared: { en: 'Cleared', th: 'ผ่านแล้ว' },
  held: { en: 'Held', th: 'ถูกกัก' }
}

export default function KoreaOrderTrackingPage() {
  const [lang, setLang] = useState<'en' | 'th'>('th')
  const [records, setRecords] = useState<TrackRecord[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PO[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editID, setEditID] = useState<number | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedID, setExpandedID] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [poSearch, setPoSearch] = useState('')

  const L = (en: string, th: string) => lang === 'th' ? th : en

  useEffect(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLang(l)
    } catch (_) {}
    const handler = (e: any) => {
      const v = e.detail?.locale || e.detail
      if (v === 'en' || v === 'th') setLang(v)
    }
    window.addEventListener('locale-changed', handler)
    window.addEventListener('k-system-lang', handler)
    return () => { window.removeEventListener('locale-changed', handler); window.removeEventListener('k-system-lang', handler) }
  }, [])

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/korea-order-tracking')
      const j = await res.json()
      if (j.ok) setRecords(j.data || [])
    } catch (_) {}
    setLoading(false)
  }, [])

  const fetchPOs = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/mysql-proxy', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'SELECT orderID, orderNo, customer_name, priceTotal, status FROM purchase_orders ORDER BY orderID DESC LIMIT 100' })
      })
      const j = await res.json()
      if (j.data) setPurchaseOrders(j.data)
    } catch (_) {}
  }, [])

  useEffect(() => { fetchRecords(); fetchPOs() }, [fetchRecords, fetchPOs])

  const openNew = () => { setEditID(null); setForm({ ...emptyForm }); setPoSearch(''); setShowForm(true) }

  const openEdit = (rec: TrackRecord) => {
    setEditID(rec.trackID)
    setForm({
      orderID: rec.orderID ? String(rec.orderID) : '', orderNo: rec.orderNo || '',
      orderDescription: rec.orderDescription || '', supplierName: rec.supplierName || 'Korea HQ',
      orderDate: rec.orderDate ? rec.orderDate.split('T')[0] : '',
      shippingMethod: rec.shippingMethod || 'sea', trackingNumber: rec.trackingNumber || '',
      containerNo: rec.containerNo || '', status: rec.status || 'ordered',
      estimatedDeparture: rec.estimatedDeparture ? rec.estimatedDeparture.split('T')[0] : '',
      actualDeparture: rec.actualDeparture ? rec.actualDeparture.split('T')[0] : '',
      estimatedArrival: rec.estimatedArrival ? rec.estimatedArrival.split('T')[0] : '',
      actualArrival: rec.actualArrival ? rec.actualArrival.split('T')[0] : '',
      customsStatus: rec.customsStatus || 'none', customsNotes: rec.customsNotes || '',
      warehouseLocation: rec.warehouseLocation || '', itemsSummary: rec.itemsSummary || '',
      totalValue: rec.totalValue ? String(rec.totalValue) : '', notes: rec.notes || ''
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.orderDescription && !form.itemsSummary) { alert(L('Please enter order description or items', 'กรุณากรอกรายละเอียดสินค้า')); return }
    setSaving(true)
    try {
      const payload: any = { ...form }
      if (payload.orderID) payload.orderID = parseInt(payload.orderID)
      if (payload.totalValue) payload.totalValue = parseFloat(payload.totalValue)
      if (editID) {
        payload.trackID = editID
        await fetch('/api/korea-order-tracking', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      } else {
        await fetch('/api/korea-order-tracking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      }
      setShowForm(false); fetchRecords()
    } catch (_) { alert('Error saving') }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm(L('Delete this record?', 'ต้องการลบรายการนี้?'))) return
    await fetch(`/api/korea-order-tracking?id=${id}`, { method: 'DELETE' })
    fetchRecords()
  }

  const handlePOSelect = (po: PO) => {
    setForm(f => ({
      ...f,
      orderID: String(po.orderID),
      orderNo: po.orderNo,
      orderDescription: f.orderDescription || `PO: ${po.orderNo} - ${po.customer_name}`,
      totalValue: po.priceTotal ? String(po.priceTotal) : f.totalValue
    }))
    setPoSearch('')
  }

  const daysUntil = (dateStr: string) => {
    if (!dateStr) return null
    return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
  }

  const getStatusStep = (status: string) => {
    const idx = statusFlow.indexOf(status as any)
    return idx >= 0 ? idx : 0
  }

  const filtered = (filterStatus === 'all' ? records : records.filter(r => r.status === filterStatus))
    .filter(r => !search ||
      r.trackNo.toLowerCase().includes(search.toLowerCase()) ||
      (r.orderDescription || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.orderNo || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.trackingNumber || '').toLowerCase().includes(search.toLowerCase())
    )

  const counts = { total: records.length, ordered: 0, confirmed: 0, manufacturing: 0, shipped: 0, customs: 0, arrived: 0, delivered: 0, cancelled: 0 }
  records.forEach(r => { if (counts[r.status as keyof typeof counts] !== undefined) (counts as any)[r.status]++ })
  const inTransit = counts.shipped + counts.customs

  const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', transition: 'border-color 0.2s', background: '#fff' }
  const lbl: React.CSSProperties = { fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: '#374151' }

  return (
    <AdminLayout title="Korea HQ Tracking" titleTh="ติดตามสินค้าเกาหลี">

      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg, #fcd34d 0%, #fbbf24 50%, #f59e0b 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 24, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
              <img src="https://flagcdn.com/kr.svg" alt="Korea" width={36} height={26} style={{ borderRadius: 4, objectFit: 'cover', verticalAlign: 'middle', marginRight: 10, display: 'inline-block' }} />
              {L('Korea HQ Order Tracking', 'ติดตามสินค้าจากสำนักงานใหญ่เกาหลี')}
            </h2>
            <p style={{ margin: '6px 0 0', fontSize: 14, opacity: 0.9 }}>
              {L('Track orders from Korea headquarters to Thailand branch', 'ตรวจสอบสถานะรายการสั่งสินค้าและกำหนดการสินค้าถึงสาขาประเทศไทย')}
            </p>
          </div>
          <button onClick={openNew} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10,
            border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)',
            color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(4px)'
          }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
          onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {L('New Order', 'เพิ่มรายการ')}
          </button>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 12, marginTop: 20 }}>
          {[
            { key: 'total', label: L('Total', 'ทั้งหมด'), count: counts.total, icon: '📋' },
            { key: 'ordered', label: L('Ordered', 'สั่งแล้ว'), count: counts.ordered, icon: '📝' },
            { key: 'manufacturing', label: L('Making', 'ผลิต'), count: counts.manufacturing, icon: '🏭' },
            { key: 'inTransit', label: L('In Transit', 'ระหว่างทาง'), count: inTransit, icon: '🚢' },
            { key: 'arrived', label: L('Arrived', 'ถึงแล้ว'), count: counts.arrived, icon: '📦' },
            { key: 'delivered', label: L('Delivered', 'ส่งแล้ว'), count: counts.delivered, icon: '✅' },
          ].map(s => (
            <div key={s.key} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '12px 16px', textAlign: 'center', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{s.count}</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['all', ...statusFlow, 'cancelled'] as const).map(s => {
            const active = filterStatus === s
            const st = statusMap[s as string]
            return (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: '7px 14px', borderRadius: 20, border: active ? 'none' : '1px solid #e2e8f0',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                background: active ? (s === 'all' ? '#1e293b' : st?.bg || '#1e293b') : '#fff',
                color: active ? (s === 'all' ? '#fff' : st?.color || '#fff') : '#64748b'
              }}>
                {s === 'all' ? L('All', 'ทั้งหมด') : L(st?.en || s, st?.th || s)}
              </button>
            )
          })}
        </div>
        <div style={{ position: 'relative', minWidth: 220 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={L('Search...', 'ค้นหา...')}
            style={{ ...inp, paddingLeft: 34, borderRadius: 20, fontSize: 13 }} />
        </div>
      </div>

      {/* Records List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: '#fbbf24', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          {L('Loading...', 'กำลังโหลด...')}
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8', background: '#f8fafc', borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>
            <img src="https://flagcdn.com/kr.svg" alt="Korea" width={64} height={48} style={{ borderRadius: 8, objectFit: 'cover', display: 'inline-block' }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{L('No tracking records', 'ไม่พบรายการติดตาม')}</div>
          <div style={{ fontSize: 13 }}>{L('Create your first order tracking', 'สร้างรายการติดตามสินค้าแรก')}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(rec => {
            const st = statusMap[rec.status] || statusMap.ordered
            const isExpanded = expandedID === rec.trackID
            const stepIdx = getStatusStep(rec.status)
            const dl = daysUntil(rec.estimatedArrival)
            return (
              <div key={rec.trackID} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'box-shadow 0.2s', boxShadow: isExpanded ? '0 4px 20px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)' }}>

                {/* Main Row */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: 14, cursor: 'pointer', flexWrap: 'wrap' }}
                  onClick={() => setExpandedID(isExpanded ? null : rec.trackID)}>

                  {/* Track No */}
                  <div style={{ minWidth: 110 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#d4940a', letterSpacing: '-0.02em' }}>{rec.trackNo}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      {rec.orderDate ? new Date(rec.orderDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : ''}
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {rec.orderDescription || rec.itemsSummary || '-'}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                      {shippingIcons[rec.shippingMethod] || '📦'} {L(shippingLabels[rec.shippingMethod]?.en || rec.shippingMethod, shippingLabels[rec.shippingMethod]?.th || rec.shippingMethod)}
                      {rec.orderNo ? ` • PO: ${rec.orderNo}` : ''}
                    </div>
                  </div>

                  {/* Timeline Progress */}
                  <div style={{ width: 200, minWidth: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {statusFlow.map((s, i) => {
                        const done = i <= stepIdx && rec.status !== 'cancelled'
                        const active = i === stepIdx && rec.status !== 'cancelled'
                        return (
                          <React.Fragment key={s}>
                            <div style={{
                              width: active ? 14 : 10, height: active ? 14 : 10, borderRadius: '50%', flexShrink: 0,
                              background: done ? statusMap[s]?.color || '#f59e0b' : '#e2e8f0',
                              border: active ? '3px solid ' + (statusMap[s]?.bg || '#fef3c7') : 'none',
                              transition: 'all 0.3s'
                            }} title={L(statusMap[s]?.en || s, statusMap[s]?.th || s)} />
                            {i < statusFlow.length - 1 && (
                              <div style={{ flex: 1, height: 3, background: i < stepIdx && rec.status !== 'cancelled' ? '#fbbf24' : '#e2e8f0', borderRadius: 2, transition: 'background 0.3s' }} />
                            )}
                          </React.Fragment>
                        )
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                      <span>{L('Order', 'สั่ง')}</span>
                      <span>{L('Ship', 'ส่ง')}</span>
                      <span>{L('Done', 'สำเร็จ')}</span>
                    </div>
                  </div>

                  {/* ETA */}
                  <div style={{ width: 80, textAlign: 'center' }}>
                    {rec.estimatedArrival ? (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 700, color: dl !== null && dl <= 0 ? '#059669' : dl !== null && dl <= 7 ? '#fbbf24' : '#64748b' }}>
                          {dl !== null ? (dl <= 0 ? L('Arrived', 'ถึงแล้ว') : `${dl} ${L('days', 'วัน')}`) : '-'}
                        </div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                          {new Date(rec.estimatedArrival).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                        </div>
                      </>
                    ) : <span style={{ fontSize: 12, color: '#cbd5e1' }}>-</span>}
                  </div>

                  {/* Status */}
                  <span style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: st.bg, color: st.color, whiteSpace: 'nowrap'
                  }}>
                    {L(st.en, st.th)}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(rec)} title={L('Edit', 'แก้ไข')} style={{
                      width: 34, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(rec.trackID)} title={L('Delete', 'ลบ')} style={{
                      width: 34, height: 34, borderRadius: 8, border: '1px solid #fecaca', background: '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>

                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"
                    style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #f1f5f9', background: '#fafbfc', padding: '20px 24px' }}>
                    {/* Full Timeline */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, marginBottom: 20, overflowX: 'auto', padding: '0 8px' }}>
                      {statusFlow.map((s, i) => {
                        const done = i <= stepIdx && rec.status !== 'cancelled'
                        const active = i === stepIdx && rec.status !== 'cancelled'
                        const sm = statusMap[s]
                        return (
                          <React.Fragment key={s}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 70, position: 'relative' }}>
                              <div style={{
                                width: active ? 32 : 24, height: active ? 32 : 24, borderRadius: '50%', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: active ? 16 : 12,
                                background: done ? sm?.color || '#f59e0b' : '#e2e8f0', color: done ? '#fff' : '#94a3b8',
                                border: active ? `3px solid ${sm?.bg || '#fef3c7'}` : 'none', fontWeight: 700,
                                boxShadow: active ? `0 0 0 4px ${sm?.bg || '#fef3c7'}` : 'none', transition: 'all 0.3s'
                              }}>
                                {done ? '✓' : i + 1}
                              </div>
                              <div style={{ fontSize: 10, fontWeight: 600, marginTop: 6, color: done ? sm?.color : '#94a3b8', textAlign: 'center', lineHeight: 1.2 }}>
                                {L(sm?.en || s, sm?.th || s)}
                              </div>
                            </div>
                            {i < statusFlow.length - 1 && (
                              <div style={{ flex: 1, height: 3, background: i < stepIdx && rec.status !== 'cancelled' ? '#fbbf24' : '#e2e8f0', borderRadius: 2, marginTop: active ? 15 : 11, minWidth: 20 }} />
                            )}
                          </React.Fragment>
                        )
                      })}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                      {[
                        { icon: '📦', label: L('Items', 'รายการสินค้า'), value: rec.itemsSummary },
                        { icon: '💰', label: L('Total Value', 'มูลค่ารวม'), value: rec.totalValue ? `${Number(rec.totalValue).toLocaleString()} ${L('THB', 'บาท')}` : null },
                        { icon: '🏢', label: L('Supplier', 'ผู้จัดส่ง'), value: rec.supplierName },
                        { icon: '🚢', label: L('Tracking No.', 'เลขพัสดุ'), value: rec.trackingNumber },
                        { icon: '📋', label: L('Container/AWB', 'เลขตู้/AWB'), value: rec.containerNo },
                        { icon: '📅', label: L('Est. Departure', 'กำหนดออก'), value: rec.estimatedDeparture ? new Date(rec.estimatedDeparture).toLocaleDateString('th-TH') : null },
                        { icon: '🛬', label: L('Est. Arrival', 'กำหนดถึง'), value: rec.estimatedArrival ? new Date(rec.estimatedArrival).toLocaleDateString('th-TH') : null },
                        { icon: '✅', label: L('Actual Arrival', 'ถึงจริง'), value: rec.actualArrival ? new Date(rec.actualArrival).toLocaleDateString('th-TH') : null },
                        { icon: '🛃', label: L('Customs', 'ศุลกากร'), value: customsLabels[rec.customsStatus] ? L(customsLabels[rec.customsStatus].en, customsLabels[rec.customsStatus].th) : null },
                        { icon: '🏪', label: L('Warehouse', 'คลังสินค้า'), value: rec.warehouseLocation },
                        { icon: '📝', label: L('Notes', 'หมายเหตุ'), value: rec.notes },
                      ].filter(d => d.value).map((d, i) => (
                        <div key={i}>
                          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{d.icon} {d.label}</div>
                          <div style={{ fontSize: 14, color: '#334155', whiteSpace: 'pre-line' }}>{d.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ====== Form Modal ====== */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 800, width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>

            {/* Modal Header */}
            <div style={{ padding: '24px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1e293b' }}>
                  <img src="https://flagcdn.com/kr.svg" alt="Korea" width={28} height={20} style={{ borderRadius: 3, objectFit: 'cover', verticalAlign: 'middle', marginRight: 8, display: 'inline-block' }} />
                  {editID ? L('Edit Order Tracking', 'แก้ไขรายการติดตาม') : L('New Order from Korea HQ', 'เพิ่มรายการสั่งสินค้าจากเกาหลี')}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#94a3b8' }}>
                  {L('Track shipment from Korea to Thailand', 'ติดตามการจัดส่งจากเกาหลีมาไทย')}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontSize: 18, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ padding: '20px 28px 28px' }}>

              {/* Link PO (optional) */}
              {!editID && (
                <div style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #fcd34d' }}>
                  <label style={{ ...lbl, color: '#92400e', fontSize: 14 }}>
                    📋 {L('Link to Purchase Order (optional)', 'เชื่อมกับใบสั่งซื้อ (ไม่บังคับ)')}
                  </label>
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <input value={poSearch} onChange={e => setPoSearch(e.target.value)}
                      placeholder={L('Search PO number...', 'ค้นหาเลข PO...')}
                      style={{ ...inp, borderColor: '#fcd34d' }} />
                  </div>
                  {poSearch && (
                    <div style={{ maxHeight: 150, overflowY: 'auto', borderRadius: 8, border: '1px solid #fcd34d', background: '#fff' }}>
                      {purchaseOrders.filter(po =>
                        po.orderNo.toLowerCase().includes(poSearch.toLowerCase()) ||
                        (po.customer_name || '').toLowerCase().includes(poSearch.toLowerCase())
                      ).map(po => (
                        <div key={po.orderID} onClick={() => handlePOSelect(po)}
                          style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #fef3c7', fontSize: 13 }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fffbeb'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                          <span style={{ fontWeight: 700, color: '#d4940a' }}>{po.orderNo}</span>
                          <span style={{ marginLeft: 8, color: '#64748b' }}>{po.customer_name}</span>
                          <span style={{ float: 'right', color: '#059669', fontWeight: 600 }}>{Number(po.priceTotal || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {form.orderNo && (
                    <div style={{ marginTop: 8, fontSize: 13, color: '#92400e', fontWeight: 600 }}>
                      ✓ {L('Linked to', 'เชื่อมกับ')} {form.orderNo}
                      <button onClick={() => setForm(f => ({ ...f, orderID: '', orderNo: '' }))}
                        style={{ marginLeft: 8, padding: '2px 10px', borderRadius: 6, border: '1px solid #fcd34d', background: '#fff', cursor: 'pointer', fontSize: 12, color: '#d4940a' }}>
                        {L('Clear', 'ล้าง')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Order Info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📦</span>
                  {L('Order Information', 'ข้อมูลการสั่งซื้อ')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>{L('Order Description', 'รายละเอียดคำสั่งซื้อ')} <span style={{ color: '#ef4444' }}>*</span></label>
                    <textarea value={form.orderDescription} onChange={e => setForm(f => ({ ...f, orderDescription: e.target.value }))} style={{ ...inp, minHeight: 60, resize: 'vertical' }}
                      placeholder={L('Description of order from Korea HQ', 'รายละเอียดสินค้าที่สั่งจากเกาหลี')} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Supplier', 'ผู้จัดส่ง')}</label>
                    <input value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Order Date', 'วันที่สั่ง')}</label>
                    <input type="date" value={form.orderDate} onChange={e => setForm(f => ({ ...f, orderDate: e.target.value }))} style={inp} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>{L('Items Summary', 'สรุปรายการสินค้า')}</label>
                    <textarea value={form.itemsSummary} onChange={e => setForm(f => ({ ...f, itemsSummary: e.target.value }))} style={{ ...inp, minHeight: 50, resize: 'vertical' }} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Total Value (THB)', 'มูลค่ารวม (บาท)')}</label>
                    <input type="number" value={form.totalValue} onChange={e => setForm(f => ({ ...f, totalValue: e.target.value }))} style={inp} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={lbl}>{L('Status', 'สถานะ')}</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inp}>
                      {[...statusFlow, 'cancelled'].map(s => {
                        const sm = statusMap[s]
                        return <option key={s} value={s}>{L(sm?.en || s, sm?.th || s)}</option>
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🚢</span>
                  {L('Shipping Details', 'ข้อมูลการจัดส่ง')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>{L('Shipping Method', 'วิธีจัดส่ง')}</label>
                    <select value={form.shippingMethod} onChange={e => setForm(f => ({ ...f, shippingMethod: e.target.value }))} style={inp}>
                      {Object.entries(shippingLabels).map(([k, v]) => (
                        <option key={k} value={k}>{shippingIcons[k]} {L(v.en, v.th)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>{L('Tracking Number', 'เลขพัสดุ')}</label>
                    <input value={form.trackingNumber} onChange={e => setForm(f => ({ ...f, trackingNumber: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Container / AWB No.', 'เลขตู้คอนเทนเนอร์ / AWB')}</label>
                    <input value={form.containerNo} onChange={e => setForm(f => ({ ...f, containerNo: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Est. Departure', 'กำหนดออกจากเกาหลี')}</label>
                    <input type="date" value={form.estimatedDeparture} onChange={e => setForm(f => ({ ...f, estimatedDeparture: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Actual Departure', 'ออกจริง')}</label>
                    <input type="date" value={form.actualDeparture} onChange={e => setForm(f => ({ ...f, actualDeparture: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Est. Arrival (Thailand)', 'กำหนดถึงไทย')}</label>
                    <input type="date" value={form.estimatedArrival} onChange={e => setForm(f => ({ ...f, estimatedArrival: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>{L('Actual Arrival', 'ถึงจริง')}</label>
                    <input type="date" value={form.actualArrival} onChange={e => setForm(f => ({ ...f, actualArrival: e.target.value }))} style={inp} />
                  </div>
                </div>
              </div>

              {/* Customs & Warehouse */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🛃</span>
                  {L('Customs & Warehouse', 'ศุลกากรและคลังสินค้า')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={lbl}>{L('Customs Status', 'สถานะศุลกากร')}</label>
                    <select value={form.customsStatus} onChange={e => setForm(f => ({ ...f, customsStatus: e.target.value }))} style={inp}>
                      {Object.entries(customsLabels).map(([k, v]) => (
                        <option key={k} value={k}>{L(v.en, v.th)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>{L('Warehouse Location', 'สถานที่คลังสินค้า')}</label>
                    <input value={form.warehouseLocation} onChange={e => setForm(f => ({ ...f, warehouseLocation: e.target.value }))} style={inp} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={lbl}>{L('Customs Notes', 'หมายเหตุศุลกากร')}</label>
                    <textarea value={form.customsNotes} onChange={e => setForm(f => ({ ...f, customsNotes: e.target.value }))} style={{ ...inp, minHeight: 50, resize: 'vertical' }} />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 24 }}>
                <label style={lbl}>{L('Notes', 'หมายเหตุ')}</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inp, minHeight: 60, resize: 'vertical' }} />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #f1f5f9', paddingTop: 20 }}>
                <button onClick={() => setShowForm(false)} style={{ padding: '11px 28px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#475569' }}>
                  {L('Cancel', 'ยกเลิก')}
                </button>
                <button onClick={handleSave} disabled={saving} style={{
                  padding: '11px 28px', borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 700, fontSize: 14, color: '#fff',
                  background: saving ? '#94a3b8' : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  boxShadow: saving ? 'none' : '0 4px 12px rgba(251,191,36,0.4)'
                }}>
                  {saving ? L('Saving...', 'กำลังบันทึก...') : editID ? L('Update', 'อัปเดต') : L('Create Tracking', 'สร้างรายการติดตาม')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
