"use client"
import React, { useState, useEffect } from 'react'
import AccWindow from '../../components/AccWindow'

type Supplier = {
  id?: number; code?: string; name_th: string; name_en?: string; tax_id?: string
  contact_name?: string; phone?: string; email?: string; address?: string
  credit_days?: number; is_active?: number
}

const empty: Supplier = { name_th: '', name_en: '', tax_id: '', contact_name: '', phone: '', email: '', address: '', credit_days: 30, is_active: 1 }

const th: any = { padding: '8px 14px', background: '#4b5563', color: '#fff', fontSize: 13, fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }
const td: any = { padding: '7px 14px', borderBottom: '1px solid #e5e7eb', fontSize: 13.5 }
const inp: React.CSSProperties = { width: '100%', padding: '3px 6px', border: '1px solid', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', fontSize: 13, boxSizing: 'border-box' }
const btn = (bg: string, color = '#000'): React.CSSProperties => ({
  padding: '3px 14px', background: bg, color, border: '2px solid', fontSize: 13, cursor: 'pointer',
  border: '1px solid #d1d5db', borderRadius: 8, fontFamily: '"Sarabun","Tahoma",sans-serif'
})

export default function SuppliersPage() {
  const [data, setData] = useState<Supplier[]>([])
  const [form, setForm] = useState<Supplier>(empty)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState('')

  const load = async () => {
    const res = await fetch('/api/accounting/suppliers' + (search ? '?q=' + encodeURIComponent(search) : ''))
    const d = await res.json()
    if (d.ok) setData(d.data)
  }
  useEffect(() => { load() }, [])

  const save = async () => {
    setLoading(true); setMsg('')
    const method = form.id ? 'PUT' : 'POST'
    const res = await fetch('/api/accounting/suppliers', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await res.json()
    if (d.ok) { setShowForm(false); setForm(empty); load(); setMsg('บันทึกสำเร็จ') }
    else setMsg('Error: ' + d.error)
    setLoading(false)
  }

  const del = async (id: number) => {
    if (!confirm('ลบผู้จำหน่ายนี้?')) return
    await fetch('/api/accounting/suppliers?id=' + id, { method: 'DELETE' })
    load()
  }

  return (
    <AccWindow title="รายละเอียดผู้จำหน่าย">
      <div style={{ padding: 12 }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button style={btn('#f3f4f6')} onClick={() => { setForm(empty); setShowForm(true) }}>+ เพิ่มใหม่</button>
          <input style={{ ...inp, width: 200 }} placeholder="ค้นหาชื่อ / รหัส / เลขที่ภาษี" value={search}
            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
          <button style={btn('#f3f4f6')} onClick={load}>ค้นหา</button>
          {msg && <span style={{ color: msg.startsWith('Error') ? 'red' : 'green', fontSize: 13 }}>{msg}</span>}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', border: '1px solid #d1d5db', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['รหัส','ชื่อผู้จำหน่าย','เลขที่ภาษี','โทรศัพท์','เครดิต(วัน)','สถานะ',''].map((h, i) => (
                  <th key={i} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr><td colSpan={7} style={{ ...td, textAlign: 'center', color: '#888', padding: 20 }}>ไม่มีข้อมูล</td></tr>
              )}
              {data.map((row: any, i) => (
                <tr key={row.id} style={{ background: i % 2 ? '#f5f5f5' : '#fff' }}>
                  <td style={td}>{row.code}</td>
                  <td style={td}>{row.name_th}</td>
                  <td style={td}>{row.tax_id}</td>
                  <td style={td}>{row.phone}</td>
                  <td style={{ ...td, textAlign: 'center' }}>{row.credit_days}</td>
                  <td style={{ ...td, textAlign: 'center' }}>
                    <span style={{ color: row.is_active ? 'green' : 'red' }}>{row.is_active ? 'ใช้งาน' : 'ระงับ'}</span>
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <button style={{ ...btn('#f3f4f6'), marginRight: 3 }} onClick={() => { setForm({ ...row }); setShowForm(true) }}>แก้ไข</button>
                    <button style={{ ...btn('#f3f4f6', '#cc0000') }} onClick={() => del(row.id)}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showForm && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              background: '#fff', border: '2px solid', border: '1px solid #d1d5db', borderRadius: 8,
              minWidth: 460, maxWidth: 560, width: '95%', boxShadow: '4px 4px 12px rgba(0,0,0,0.4)',
            }}>
              <div style={{ background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)', padding: '3px 8px', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                <span>{form.id ? 'แก้ไขผู้จำหน่าย' : 'เพิ่มผู้จำหน่าย'}</span>
                <span style={{ cursor: 'pointer' }} onClick={() => setShowForm(false)}>✕</span>
              </div>
              <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                {[
                  ['ชื่อ (ภาษาไทย) *', 'name_th', 'text'],
                  ['ชื่อ (ภาษาอังกฤษ)', 'name_en', 'text'],
                  ['เลขที่ผู้เสียภาษี', 'tax_id', 'text'],
                  ['ชื่อผู้ติดต่อ', 'contact_name', 'text'],
                  ['โทรศัพท์', 'phone', 'text'],
                  ['อีเมล', 'email', 'email'],
                  ['เครดิต (วัน)', 'credit_days', 'number'],
                ].map(([label, key, type]) => (
                  <div key={key as string} style={key === 'name_th' || key === 'name_en' ? { gridColumn: 'span 2' } : {}}>
                    <div style={{ fontSize: 12, marginBottom: 2 }}>{label}</div>
                    <input style={inp} type={type as string} value={(form as any)[key as string] || ''}
                      onChange={e => setForm(f => ({ ...f, [key as string]: e.target.value }))} />
                  </div>
                ))}
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: 12, marginBottom: 2 }}>ที่อยู่</div>
                  <textarea style={{ ...inp, height: 60, resize: 'vertical' }} value={form.address || ''}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked ? 1 : 0 }))} />
                    {' '}ใช้งาน
                  </label>
                </div>
              </div>
              <div style={{ padding: '8px 16px 12px', display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid #999' }}>
                <button style={btn('#f3f4f6')} onClick={() => setShowForm(false)}>ยกเลิก</button>
                <button style={btn('#f3f4f6', '#4b5563')} disabled={loading} onClick={save}>
                  {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccWindow>
  )
}
