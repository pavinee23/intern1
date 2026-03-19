"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'
import styles from '../../../admin-theme.module.css'

type ItemType = {
  product_code: string
  product_name: string
  quantity: number
  unit: string
  estimated_price: number
}

export default function CreatePurchaseRequestPage() {
  const router = useRouter()

  const [prNo, setPrNo] = useState('')
  const [prDate, setPrDate] = useState(() => new Date().toISOString().split('T')[0])
  const [requesterName, setRequesterName] = useState('')
  const [department, setDepartment] = useState('')
  const [purpose, setPurpose] = useState('')
  const [requiredDate, setRequiredDate] = useState('')
  const [notes, setNotes] = useState('')

  const [items, setItems] = useState<ItemType[]>([{ product_code: '', product_name: '', quantity: 1, unit: 'pcs', estimated_price: 0 }])
  const [totalCost, setTotalCost] = useState(0)

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [messageBar, setMessageBar] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [locale, setLocale] = useState<'en'|'th'>('th')

  useEffect(() => {
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      if (l === 'en' || l === 'th') setLocale(l as 'en'|'th')
    } catch {}

    const handler = (e: Event) => {
      const d = (e as any).detail
      const v = typeof d === 'string' ? d : d?.locale
      if (v === 'en' || v === 'th') setLocale(v)
    }
    window.addEventListener('k-system-lang', handler)
    window.addEventListener('locale-changed', handler)
    return () => {
      window.removeEventListener('k-system-lang', handler)
      window.removeEventListener('locale-changed', handler)
    }
  }, [])

  const L = (en: string, th: string) => locale === 'th' ? th : en

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.quantity * item.estimated_price), 0)
    setTotalCost(total)
  }, [items])

  function addItem() {
    setItems([...items, { product_code: '', product_name: '', quantity: 1, unit: 'pcs', estimated_price: 0 }])
  }

  function updateItem(i: number, key: keyof ItemType, value: any) {
    const copy = [...items]
    if (key === 'product_code' || key === 'product_name' || key === 'unit') {
      copy[i][key] = value
    } else {
      copy[i][key] = Number(value)
    }
    setItems(copy)
  }

  function removeItem(i: number) {
    if (items.length === 1) return
    setItems(items.filter((_, idx) => idx !== i))
  }

  function validate() {
    const errs: string[] = []

    if (!requesterName) errs.push(L('Requester name is required', 'กรุณาระบุชื่อผู้ขอซื้อ'))
    if (!department) errs.push(L('Department is required', 'กรุณาระบุแผนก'))
    if (!requiredDate) errs.push(L('Required date is required', 'กรุณาระบุวันที่ต้องการ'))

    if (requiredDate && new Date(requiredDate) < new Date(prDate)) {
      errs.push(L('Required date must be >= request date', 'วันที่ต้องการต้อง >= วันที่ขอซื้อ'))
    }

    if (items.length === 0) errs.push(L('At least 1 item required', 'ต้องมีอย่างน้อย 1 รายการ'))

    items.forEach((item, idx) => {
      if (!item.product_name) errs.push(L(`Item ${idx + 1} needs product name`, `รายการที่ ${idx + 1} ต้องมีชื่อสินค้า`))
      if (item.quantity <= 0) errs.push(L(`Item ${idx + 1} quantity must be > 0`, `รายการที่ ${idx + 1} จำนวนต้อง > 0`))
    })

    setErrors(errs)
    return errs.length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const user = JSON.parse(localStorage.getItem('k_system_admin_user') || '{}')
      const created_by = user?.username || user?.name || 'system'

      const payload = {
        prDate,
        requester_name: requesterName,
        department,
        purpose,
        required_date: requiredDate,
        items: items.map(item => ({
          product_code: item.product_code,
          product_name: item.product_name,
          quantity: item.quantity,
          unit: item.unit,
          estimated_price: item.estimated_price,
          total_price: item.quantity * item.estimated_price
        })),
        notes,
        created_by
      }

      const res = await fetch('/api/purchase-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const j = await res.json()

      if (res.ok && j.success) {
        setMessageBar({ type: 'success', text: L('Purchase request created successfully', 'สร้างใบขอซื้อสำเร็จ') })
        setTimeout(() => router.push('/Thailand/Admin-Login/documents/purchase-requests'), 900)
      } else {
        setMessageBar({ type: 'error', text: L('Failed: ', 'ล้มเหลว: ') + (j.error || 'Unknown error') })
      }
    } catch (err) {
      console.error(err)
      setMessageBar({ type: 'error', text: L('Error occurred', 'เกิดข้อผิดพลาด') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Create Purchase Request" titleTh="สร้างใบขอซื้อ">
      {messageBar && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          borderRadius: 8,
          color: messageBar.type === 'error' ? '#7f1d1d' : '#064e3b',
          background: messageBar.type === 'error' ? '#fee2e2' : '#ecfdf5',
          border: messageBar.type === 'error' ? '1px solid #fca5a5' : '1px solid #86efac'
        }}>
          {messageBar.text}
        </div>
      )}

      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            {L('Create Purchase Request', 'สร้างใบขอซื้อ')}
          </h2>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('PR No.', 'เลขที่ PR')}</label>
                <input type="text" value={prNo || L('Auto-generated', 'สร้างอัตโนมัติ')} disabled className={styles.formInput} style={{ background: '#f5f5f5' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input type="date" value={prDate} readOnly className={styles.formInput} style={{ background: '#f5f5f5' }} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Requester Name', 'ชื่อผู้ขอซื้อ')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={requesterName} onChange={e => setRequesterName(e.target.value)} className={styles.formInput} placeholder={L('Enter requester name', 'กรอกชื่อผู้ขอซื้อ')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Department', 'แผนก')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className={styles.formInput} placeholder={L('Enter department', 'กรอกแผนก')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Required Date', 'วันที่ต้องการ')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="date" value={requiredDate} onChange={e => setRequiredDate(e.target.value)} className={styles.formInput} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{L('Purpose', 'วัตถุประสงค์')}</label>
              <textarea value={purpose} onChange={e => setPurpose(e.target.value)} className={styles.formInput} rows={2} placeholder={L('Why is this needed...', 'เหตุผลที่ต้องการ...')} />
            </div>

            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600 }}>{L('Items', 'รายการสินค้า')}</h3>

            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>{L('Product Code', 'รหัสสินค้า')}</th>
                    <th style={{ width: '30%' }}>{L('Product Name', 'ชื่อสินค้า')}</th>
                    <th style={{ width: '12%' }}>{L('Quantity', 'จำนวน')}</th>
                    <th style={{ width: '10%' }}>{L('Unit', 'หน่วย')}</th>
                    <th style={{ width: '13%' }}>{L('Est. Price', 'ราคาประมาณ')}</th>
                    <th style={{ width: '15%' }}>{L('Total', 'รวม')}</th>
                    <th style={{ width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td><input type="text" value={item.product_code} onChange={e => updateItem(i, 'product_code', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="text" value={item.product_name} onChange={e => updateItem(i, 'product_name', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} className={styles.formInput} min="0.01" step="0.01" style={{ width: '100%' }} /></td>
                      <td><input type="text" value={item.unit} onChange={e => updateItem(i, 'unit', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="number" value={item.estimated_price} onChange={e => updateItem(i, 'estimated_price', e.target.value)} className={styles.formInput} min="0" step="0.01" style={{ width: '100%' }} /></td>
                      <td style={{ textAlign: 'right', padding: '14px 16px' }}>{(item.quantity * item.estimated_price).toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1} className={styles.btnDanger} style={{ padding: '6px 12px', fontSize: '14px' }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" onClick={addItem} className={styles.btnSecondary} style={{ marginTop: 10 }}>+ {L('Add Item', 'เพิ่มรายการ')}</button>

            <div style={{ marginTop: 20, padding: 15, background: '#f9fafb', borderRadius: 8, textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {L('Total Estimated Cost', 'ราคาประมาณการรวม')}: <span style={{ fontSize: 18, color: '#0ea5e9' }}>{totalCost.toFixed(2)}</span>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: 20 }}>
              <label className={styles.formLabel}>{L('Notes', 'หมายเหตุ')}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className={styles.formInput} rows={2} placeholder={L('Additional notes...', 'หมายเหตุเพิ่มเติม...')} />
            </div>

            {errors.length > 0 && (
              <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: 8, background: '#fee2e2', border: '1px solid #fca5a5', color: '#7f1d1d' }}>
                {errors.map((err, idx) => (<div key={idx}>• {err}</div>))}
              </div>
            )}

            <div className={styles.formRow} style={{ justifyContent: 'space-between', marginTop: 30 }}>
              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save', 'บันทึก')}
              </button>
              <button type="button" onClick={() => router.back()} className={styles.btnOutline}>{L('Cancel', 'ยกเลิก')}</button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
