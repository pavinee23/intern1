"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'
import styles from '../../../admin-theme.module.css'

type ItemType = {
  description: string
  quantity: number
  unit_price: number
}

export default function CreateCreditNotePage() {
  const router = useRouter()

  // Document fields
  const [cnNo, setCnNo] = useState('')
  const [cnDate, setCnDate] = useState(() => new Date().toISOString().split('T')[0])
  const [customerName, setCustomerName] = useState('')
  const [invoiceRef, setInvoiceRef] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  // Items
  const [items, setItems] = useState<ItemType[]>([{ description: '', quantity: 1, unit_price: 0 }])

  // Calculations
  const [discount, setDiscount] = useState(0)
  const [vatRate, setVatRate] = useState(7)
  const [totals, setTotals] = useState({ subtotal: 0, vat: 0, total: 0 })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [messageBar, setMessageBar] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Locale
  const [locale, setLocale] = useState<'en'|'th'>('th')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  // Auto-calculate totals
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const afterDiscount = Math.max(0, subtotal - discount)
    const vat = (afterDiscount * vatRate) / 100
    const total = afterDiscount + vat
    setTotals({ subtotal, vat, total })
  }, [items, discount, vatRate])

  function addItem() {
    setItems([...items, { description: '', quantity: 1, unit_price: 0 }])
  }

  function updateItem(i: number, key: keyof ItemType, value: any) {
    const copy = [...items]
    copy[i][key] = key === 'description' ? value : Number(value)
    setItems(copy)
  }

  function removeItem(i: number) {
    if (items.length === 1) return // Keep at least 1 item
    setItems(items.filter((_, idx) => idx !== i))
  }

  function validate() {
    const errs: string[] = []

    if (!customerName) errs.push(L('Customer name is required', 'กรุณาระบุชื่อลูกค้า'))
    if (!invoiceRef) errs.push(L('Invoice reference is required', 'กรุณาระบุเลขที่ใบแจ้งหนี้อ้างอิง'))

    if (items.length === 0) {
      errs.push(L('At least 1 item required', 'ต้องมีอย่างน้อย 1 รายการ'))
    }

    items.forEach((item, idx) => {
      if (!item.description) {
        errs.push(L(`Item ${idx + 1} needs description`, `รายการที่ ${idx + 1} ต้องมีคำอธิบาย`))
      }
      if (item.quantity <= 0) {
        errs.push(L(`Item ${idx + 1} quantity must be > 0`, `รายการที่ ${idx + 1} จำนวนต้อง > 0`))
      }
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
        cnDate,
        customer_name: customerName,
        invoice_ref: invoiceRef,
        reason,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        })),
        subtotal: totals.subtotal,
        discount,
        vat: totals.vat,
        total_amount: totals.total,
        notes,
        created_by
      }

      const res = await fetch('/api/credit-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const j = await res.json()

      if (res.ok && j.success) {
        setMessageBar({ type: 'success', text: L('Credit note created successfully', 'สร้างใบลดหนี้สำเร็จ') })
        setTimeout(() => router.push('/Thailand/Admin-Login/documents/credit-notes'), 900)
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
    <AdminLayout title="Create Credit Note" titleTh="สร้างใบลดหนี้">
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
              <path d="M14 2v6h6"/>
              <path d="M9 13h6"/>
              <path d="M9 17h6"/>
            </svg>
            {L('Create Credit Note', 'สร้างใบลดหนี้')}
          </h2>
          <p className={styles.cardSubtitle}>
            {L('Issue credit note to customer', 'ออกใบลดหนี้ให้ลูกค้า')}
          </p>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            {/* Document Info */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Credit Note No.', 'เลขที่ใบลดหนี้')}</label>
                <input
                  type="text"
                  value={cnNo || L('Auto-generated', 'สร้างอัตโนมัติ')}
                  disabled
                  className={styles.formInput}
                  style={{ background: '#f5f5f5' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input
                  type="date"
                  value={cnDate}
                  readOnly
                  className={styles.formInput}
                  style={{ background: '#f5f5f5' }}
                />
              </div>
            </div>

            {/* Customer Info */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Customer Name', 'ชื่อลูกค้า')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className={styles.formInput}
                  placeholder={L('Enter customer name', 'กรอกชื่อลูกค้า')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {L('Invoice Reference', 'เลขที่ใบแจ้งหนี้อ้างอิง')} <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={invoiceRef}
                  onChange={e => setInvoiceRef(e.target.value)}
                  className={styles.formInput}
                  placeholder={L('Original invoice number', 'เลขที่ใบแจ้งหนี้เดิม')}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{L('Reason', 'เหตุผล')}</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                className={styles.formInput}
                rows={2}
                placeholder={L('Reason for credit note...', 'เหตุผลในการออกใบลดหนี้...')}
              />
            </div>

            {/* Items Table */}
            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600 }}>
              {L('Items', 'รายการสินค้า/บริการ')}
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '45%' }}>{L('Description', 'รายละเอียด')}</th>
                    <th style={{ width: '15%' }}>{L('Quantity', 'จำนวน')}</th>
                    <th style={{ width: '15%' }}>{L('Unit Price', 'ราคาต่อหน่วย')}</th>
                    <th style={{ width: '15%' }}>{L('Total', 'รวม')}</th>
                    <th style={{ width: '10%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => updateItem(i, 'description', e.target.value)}
                          className={styles.formInput}
                          placeholder={L('Item description', 'รายละเอียดสินค้า')}
                          style={{ width: '100%' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => updateItem(i, 'quantity', e.target.value)}
                          className={styles.formInput}
                          min="0.01"
                          step="0.01"
                          style={{ width: '100%' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={e => updateItem(i, 'unit_price', e.target.value)}
                          className={styles.formInput}
                          min="0"
                          step="0.01"
                          style={{ width: '100%' }}
                        />
                      </td>
                      <td style={{ textAlign: 'right', padding: '14px 16px' }}>
                        {(item.quantity * item.unit_price).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          disabled={items.length === 1}
                          className={styles.btnDanger}
                          style={{ padding: '6px 12px', fontSize: '14px' }}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={addItem}
              className={styles.btnSecondary}
              style={{ marginTop: 10 }}
            >
              + {L('Add Item', 'เพิ่มรายการ')}
            </button>

            {/* Calculation Summary */}
            <div style={{ marginTop: 30, padding: 20, background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ maxWidth: 400, marginLeft: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span>{L('Subtotal', 'ยอดรวม')}:</span>
                  <span style={{ fontWeight: 600 }}>{totals.subtotal.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span>{L('Discount', 'ส่วนลด')}:</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                    className={styles.formInput}
                    min="0"
                    step="0.01"
                    style={{ width: 150, textAlign: 'right' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span>{L('VAT', 'ภาษีมูลค่าเพิ่ม')} ({vatRate}%):</span>
                  <span style={{ fontWeight: 600 }}>{totals.vat.toFixed(2)}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 10,
                  borderTop: '2px solid #d1d5db',
                  fontSize: 18,
                  fontWeight: 700
                }}>
                  <span>{L('Total Amount', 'ยอดรวมทั้งสิ้น')}:</span>
                  <span>{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: 20 }}>
              <label className={styles.formLabel}>{L('Notes', 'หมายเหตุ')}</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className={styles.formInput}
                rows={2}
                placeholder={L('Additional notes...', 'หมายเหตุเพิ่มเติม...')}
              />
            </div>

            {errors.length > 0 && (
              <div style={{
                padding: '12px 16px',
                marginBottom: '16px',
                borderRadius: 8,
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#7f1d1d'
              }}>
                {errors.map((err, idx) => (
                  <div key={idx}>• {err}</div>
                ))}
              </div>
            )}

            <div className={styles.formRow} style={{ justifyContent: 'space-between', marginTop: 30 }}>
              <button type="submit" disabled={loading} className={styles.btnPrimary}>
                {loading ? L('Saving...', 'กำลังบันทึก...') : L('Save', 'บันทึก')}
              </button>
              <button type="button" onClick={() => router.back()} className={styles.btnOutline}>
                {L('Cancel', 'ยกเลิก')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
