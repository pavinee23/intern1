"use client"
import React, { useState, useEffect, useCallback } from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'
import SupplierSearch from '../../components/SupplierSearch'

type Item = { id?: number; product_id?: number; description: string; qty: number; unit: string; unit_price: number; is_exempt: boolean; amount: number }
type Doc = { id?: number; doc_no?: string; doc_date: string; due_date: string; supplier_id?: number; supplier_name: string; status: string; note: string; items: Item[]; exempt_amount: number; subtotal: number; vat_amount: number; wht_rate: number; wht_amount: number; total: number }

const WHT_RATES = [1, 2, 3, 5, 10, 15]
const newItem = (): Item => ({ description: '', qty: 1, unit: '', unit_price: 0, is_exempt: false, amount: 0 })
const newDoc = (): Doc => ({ doc_date: new Date().toISOString().slice(0, 10), due_date: '', supplier_name: '', status: 'draft', note: '', items: [], exempt_amount: 0, subtotal: 0, vat_amount: 0, wht_rate: 0, wht_amount: 0, total: 0 })

const TH: any = { padding: '5px 8px', background: '#4b5563', color: '#fff', border: '1px solid #6b7280', fontSize: 12, textAlign: 'left', whiteSpace: 'nowrap' }
const TD: any = { padding: '4px 7px', borderBottom: '1px solid #e5e7eb', fontSize: 12 }
const inp: any = { width: '100%', padding: '4px 7px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', fontSize: 12, boxSizing: 'border-box', fontFamily: '"Sarabun","Tahoma",sans-serif', outline: 'none' }
const btn = (bg: string, c = '#374151'): any => ({ padding: '4px 14px', background: bg, color: c, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: '"Sarabun","Tahoma",sans-serif', whiteSpace: 'nowrap' })
const fmt = (n: number) => (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (iso?: string) => { if (!iso) return '—'; const [y, m, d] = iso.slice(0, 10).split('-'); return `${d}-${m}-${+y + 543}` }

function recalc(d: Doc): Doc {
  const exempt_amount = d.items.filter(i => i.is_exempt).reduce((s, i) => s + i.amount, 0)
  const subtotal = d.items.filter(i => !i.is_exempt).reduce((s, i) => s + i.amount, 0)
  const vat_amount = Math.round(subtotal * 7) / 100
  const wht_base = subtotal + exempt_amount
  const wht_amount = d.wht_rate > 0 ? Math.round(wht_base * d.wht_rate) / 100 : 0
  const total = exempt_amount + subtotal + vat_amount - wht_amount
  return { ...d, exempt_amount, subtotal, vat_amount, wht_amount, total }
}

export default function CreditPurchasePage() {
  const { L } = useLang()
  const [list, setList] = useState<any[]>([])
  const [doc, setDoc] = useState<Doc | null>(null)
  const [supplierDisplay, setSupplierDisplay] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [search, setSearch] = useState('')

  const loadList = useCallback(async () => {
    const r = await fetch('/api/accounting/purchase-orders?payment_type=credit' + (search ? '&q=' + encodeURIComponent(search) : ''))
    const d = await r.json()
    if (d.ok) setList(d.data || [])
  }, [search])

  useEffect(() => { loadList() }, [])

  const openNew = () => { setDoc(newDoc()); setSupplierDisplay(''); setMsg('') }

  const openEdit = async (id: number) => {
    const r = await fetch(`/api/accounting/purchase-orders?id=${id}`)
    const d = await r.json()
    if (d.ok && d.data) {
      const raw = d.data
      setDoc({ ...newDoc(), ...raw, items: (raw.items || []).map((i: any) => ({ ...i, is_exempt: !!i.is_exempt })), due_date: raw.due_date?.slice(0, 10) || '', exempt_amount: +(raw.exempt_amount || 0), wht_rate: +(raw.wht_rate || 0), wht_amount: +(raw.wht_amount || 0) })
      setSupplierDisplay(raw.supplier_name || '')
    }
  }

  const del = async (id: number) => {
    if (!confirm(L('Delete this record?', 'ลบรายการนี้?'))) return
    await fetch('/api/accounting/purchase-orders?id=' + id, { method: 'DELETE' })
    loadList()
  }

  const save = async () => {
    if (!doc) return
    setLoading(true); setMsg('')
    const method = doc.id ? 'PUT' : 'POST'
    const res = await fetch('/api/accounting/purchase-orders', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...doc, payment_type: 'credit' }) })
    const d = await res.json()
    if (d.ok) { setDoc(null); loadList(); setMsg(L('Saved successfully', 'บันทึกสำเร็จ')) }
    else setMsg('Error: ' + d.error)
    setLoading(false)
  }

  const updItem = (idx: number, field: keyof Item, val: any) => {
    setDoc(prev => {
      if (!prev) return prev
      const items = prev.items.map((it, i) => {
        if (i !== idx) return it
        const u = { ...it, [field]: val }
        if (field === 'qty' || field === 'unit_price') u.amount = +(u.qty * u.unit_price).toFixed(2)
        return u
      })
      return recalc({ ...prev, items })
    })
  }

  const addItem = () => setDoc(p => p ? recalc({ ...p, items: [...p.items, newItem()] }) : p)
  const removeItem = (idx: number) => setDoc(p => p ? recalc({ ...p, items: p.items.filter((_, i) => i !== idx) }) : p)
  const toggleWht = (rate: number) => setDoc(p => p ? recalc({ ...p, wht_rate: p.wht_rate === rate ? 0 : rate }) : p)

  /* ─── FORM ─── */
  if (doc !== null) return (
    <AccWindow title={L('Credit Purchase', 'ซื้อเงินเชื่อ')}>
      <div style={{ fontFamily: '"Sarabun","Tahoma",sans-serif', fontSize: 13 }}>
        {/* Title bar */}
        <div style={{ background: 'linear-gradient(135deg,#374151,#4b5563)', padding: '6px 14px', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{doc.id ? L('Edit Credit Purchase', 'แก้ไข ซื้อเงินเชื่อ') : L('New Credit Purchase', 'ซื้อเงินเชื่อ')}</span>
          <span style={{ cursor: 'pointer', fontSize: 18, lineHeight: 1 }} onClick={() => setDoc(null)}>✕</span>
        </div>

        {/* Header fields */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #e5e7eb', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{L('Date', 'วันที่')}</div>
            <input style={inp} type="date" value={doc.doc_date} onChange={e => setDoc(d => d ? { ...d, doc_date: e.target.value } : d)} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{L('Due Date', 'วันครบกำหนด')}</div>
            <input style={inp} type="date" value={doc.due_date} onChange={e => setDoc(d => d ? { ...d, due_date: e.target.value } : d)} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{L('Supplier', 'ผู้จำหน่าย')}</div>
            <SupplierSearch value={doc.supplier_id} displayValue={supplierDisplay || doc.supplier_name}
              onChange={s => {
                if (s) { setDoc(d => d ? { ...d, supplier_id: s.id, supplier_name: s.name_th } : d); setSupplierDisplay(s.name_th) }
                else { setDoc(d => d ? { ...d, supplier_id: undefined, supplier_name: '' } : d); setSupplierDisplay('') }
              }} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{L('Status', 'สถานะ')}</div>
            <select style={inp} value={doc.status} onChange={e => setDoc(d => d ? { ...d, status: e.target.value } : d)}>
              <option value="draft">{L('Draft', 'ร่าง')}</option>
              <option value="approved">{L('Approved', 'อนุมัติ')}</option>
              <option value="paid">{L('Paid', 'ชำระแล้ว')}</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{L('Note', 'หมายเหตุ')}</div>
            <input style={inp} value={doc.note} onChange={e => setDoc(d => d ? { ...d, note: e.target.value } : d)} placeholder={L('Optional note', 'หมายเหตุ (ถ้ามี)')} />
          </div>
        </div>

        {/* Items toolbar */}
        <div style={{ padding: '6px 14px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{L('This page', 'หน้านี้')} ({doc.items.length})</span>
          <button style={btn('#e5e7eb')} onClick={addItem}>+ {L('Add', 'เพิ่ม')}</button>
        </div>

        {/* Items table */}
        <div style={{ overflowX: 'auto', borderBottom: '1px solid #e5e7eb' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...TH, width: 28, textAlign: 'center' }}>#</th>
                <th style={TH}>{L('Description', 'รายการสินค้า/บริการ')}</th>
                <th style={{ ...TH, width: 70, textAlign: 'center' }}>{L('Qty', 'จำนวน')}</th>
                <th style={{ ...TH, width: 70, textAlign: 'center' }}>{L('Unit', 'หน่วย')}</th>
                <th style={{ ...TH, width: 110, textAlign: 'right' }}>{L('Unit Price', 'ราคา/หน่วย')}</th>
                <th style={{ ...TH, width: 64, textAlign: 'center' }}>{L('Exempt', 'ยกเว้นภาษี')}</th>
                <th style={{ ...TH, width: 100, textAlign: 'right' }}>{L('Amount', 'รวม')}</th>
                <th style={{ ...TH, width: 28 }}></th>
              </tr>
            </thead>
            <tbody>
              {doc.items.length === 0 && (
                <tr><td colSpan={8} style={{ ...TD, textAlign: 'center', color: '#9ca3af', padding: '18px 0' }}>{L('No items — click Add to begin', 'ไม่มีรายการ — กด เพิ่ม เพื่อเพิ่มรายการสินค้า')}</td></tr>
              )}
              {doc.items.map((item, idx) => (
                <tr key={idx} style={{ background: idx % 2 ? '#f9fafb' : '#fff' }}>
                  <td style={{ ...TD, textAlign: 'center', color: '#9ca3af' }}>{idx + 1}</td>
                  <td style={TD}><input style={inp} value={item.description} placeholder={L('Item description', 'รายการ')} onChange={e => updItem(idx, 'description', e.target.value)} /></td>
                  <td style={TD}><input style={{ ...inp, textAlign: 'right' }} type="number" min="0" step="any" value={item.qty} onChange={e => updItem(idx, 'qty', +e.target.value || 0)} /></td>
                  <td style={TD}><input style={inp} value={item.unit} placeholder={L('pcs', 'ชิ้น')} onChange={e => updItem(idx, 'unit', e.target.value)} /></td>
                  <td style={TD}><input style={{ ...inp, textAlign: 'right' }} type="number" min="0" step="0.01" value={item.unit_price} onChange={e => updItem(idx, 'unit_price', +e.target.value || 0)} /></td>
                  <td style={{ ...TD, textAlign: 'center' }}><input type="checkbox" checked={item.is_exempt} onChange={e => updItem(idx, 'is_exempt', e.target.checked)} /></td>
                  <td style={{ ...TD, textAlign: 'right', fontWeight: 600 }}>{fmt(item.amount)}</td>
                  <td style={TD}><button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14, padding: '0 2px' }} onClick={() => removeItem(idx)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tax summary */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 340 }}>
            <tbody>
              <tr>
                <td style={{ padding: '3px 10px', fontSize: 12, color: '#374151', textAlign: 'right', minWidth: 220 }}>{L('Goods exempt from VAT', 'ราคาสินค้ายกเว้นภาษี')}</td>
                <td style={{ padding: '3px 10px', fontSize: 12, textAlign: 'right', minWidth: 100 }}>{fmt(doc.exempt_amount)}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 10px', fontSize: 12, color: '#374151', textAlign: 'right' }}>{L('Goods before VAT', 'ราคาสินค้าก่อนมูลค่าภาษี')}</td>
                <td style={{ padding: '3px 10px', fontSize: 12, textAlign: 'right' }}>{fmt(doc.subtotal)}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 10px', fontSize: 12, color: '#374151', textAlign: 'right' }}>{L('VAT 7%', 'ภาษีมูลค่าเพิ่ม 7%')}</td>
                <td style={{ padding: '3px 10px', fontSize: 12, textAlign: 'right' }}>{fmt(doc.vat_amount)}</td>
              </tr>
              <tr>
                <td style={{ padding: '3px 10px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#374151' }}>{L('Withholding Tax', 'หัก ณ ที่จ่าย')}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{L('Rate', 'เงื่อนไข')}</span>
                    {WHT_RATES.map(r => (
                      <button key={r} onClick={() => toggleWht(r)}
                        style={{ padding: '1px 5px', fontSize: 11, cursor: 'pointer', borderRadius: 4, border: '1px solid #d1d5db', background: doc.wht_rate === r ? '#374151' : '#f3f4f6', color: doc.wht_rate === r ? '#fff' : '#374151', fontFamily: '"Sarabun","Tahoma",sans-serif' }}>
                        {r}%
                      </button>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '3px 10px', fontSize: 12, textAlign: 'right', color: doc.wht_amount > 0 ? '#dc2626' : undefined }}>
                  {doc.wht_amount > 0 ? '-' : ''}{fmt(doc.wht_amount)}
                </td>
              </tr>
              <tr style={{ borderTop: '2px solid #374151' }}>
                <td style={{ padding: '5px 10px', fontSize: 14, fontWeight: 700, color: '#111827', textAlign: 'right' }}>{L('Total', 'รวม')}</td>
                <td style={{ padding: '5px 10px', fontSize: 14, fontWeight: 700, color: '#111827', textAlign: 'right' }}>{fmt(doc.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action buttons */}
        <div style={{ padding: '10px 14px', display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
          {msg && <span style={{ fontSize: 12, color: msg.startsWith('Error') ? '#dc2626' : '#16a34a' }}>{msg}</span>}
          <button style={btn('#f3f4f6')} onClick={() => setDoc(null)}>{L('Cancel', 'ยกเลิก')}</button>
          <button style={btn('#374151', '#fff')} disabled={loading} onClick={save}>{loading ? '...' : L('Save', 'บันทึก')}</button>
        </div>
      </div>
    </AccWindow>
  )

  /* ─── LIST ─── */
  return (
    <AccWindow title={L('Credit Purchase', 'ซื้อเงินเชื่อ')}>
      <div style={{ padding: 12, fontFamily: '"Sarabun","Tahoma",sans-serif' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button style={btn('#f3f4f6')} onClick={openNew}>+ {L('New', 'เพิ่มใหม่')}</button>
          <input style={{ ...inp, width: 200 }} placeholder={L('Search...', 'ค้นหา...')} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadList()} />
          <button style={btn('#f3f4f6')} onClick={loadList}>{L('Search', 'ค้นหา')}</button>
          {msg && <span style={{ fontSize: 12, color: msg.startsWith('Error') ? '#dc2626' : '#16a34a' }}>{msg}</span>}
        </div>
        <div style={{ overflowX: 'auto', border: '1px solid #d1d5db', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{[L('Doc No', 'เลขที่'), L('Date', 'วันที่'), L('Due Date', 'วันครบกำหนด'), L('Supplier', 'ผู้จำหน่าย'), L('Total', 'รวม'), L('Status', 'สถานะ'), ''].map((h, i) => <th key={i} style={TH}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan={7} style={{ ...TD, textAlign: 'center', color: '#9ca3af', padding: 24 }}>{L('No data', 'ไม่มีข้อมูล')}</td></tr>}
              {list.map((r: any, i) => (
                <tr key={r.id} style={{ background: i % 2 ? '#f9fafb' : '#fff' }}>
                  <td style={TD}>{r.doc_no}</td>
                  <td style={TD}>{fmtDate(r.doc_date)}</td>
                  <td style={TD}>{fmtDate(r.due_date)}</td>
                  <td style={TD}>{r.supplier_name}</td>
                  <td style={{ ...TD, textAlign: 'right', fontWeight: 700 }}>{fmt(r.total || 0)}</td>
                  <td style={{ ...TD, textAlign: 'center' }}>{r.status}</td>
                  <td style={{ ...TD, whiteSpace: 'nowrap' }}>
                    <button style={{ ...btn('#f3f4f6'), marginRight: 4 }} onClick={() => openEdit(r.id)}>{L('Edit', 'แก้ไข')}</button>
                    <button style={btn('#fef2f2', '#dc2626')} onClick={() => del(r.id)}>{L('Del', 'ลบ')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AccWindow>
  )
}
