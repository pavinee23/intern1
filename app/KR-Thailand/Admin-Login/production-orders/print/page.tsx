"use client"

import React, { useEffect, useState, Suspense } from 'react'
import PrintStyles from '../../components/PrintStyles'
import { useSearchParams } from 'next/navigation'

function ProductionOrderPrintContent() {
  const searchParams = useSearchParams()
  const poID = searchParams?.get('poID') || searchParams?.get('pdoID') || ''
  const poNo = searchParams?.get('poNo') || searchParams?.get('pdoNo') || ''
  const auto = searchParams?.get('autoPrint')
  const [hydrated, setHydrated] = useState(false)
  const [doc, setDoc] = useState<any | null>(null)
  const [salesOrder, setSalesOrder] = useState<any | null>(null)
  const [customerDetail, setCustomerDetail] = useState<any | null>(null)
  const [loggedUser, setLoggedUser] = useState<string | null>(null)
  const [printCount, setPrintCount] = useState<number>(0)
  const [lastPrinted, setLastPrinted] = useState<string | null>(null)

  const paramLangInit = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('lang') : null
  const [selectedLang, setSelectedLang] = useState<'en'|'th'>(() => {
    if (paramLangInit === 'en') return 'en'
    if (paramLangInit === 'th') return 'th'
    try {
      const l = localStorage.getItem('locale') || localStorage.getItem('k_system_lang')
      return l === 'en' ? 'en' : 'th'
    } catch { return 'th' }
  })

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    const idOrNo = poID || poNo
    if (!idOrNo) return
    ;(async () => {
      try {
        let res = await fetch(`/api/production-orders?id=${encodeURIComponent(poID)}`)
        let j = await res.json().catch(() => null)
        if (!(res.ok && j && j.success && j.productionOrder)) {
          res = await fetch(`/api/production-orders?pdoNo=${encodeURIComponent(poNo || poID)}`)
          j = await res.json().catch(() => null)
        }
        if (j && j.success) {
          const q = j.productionOrder || j.productionOrders?.[0] || null
          if (q && q.items && typeof q.items === 'string') {
            try { q.items = JSON.parse(q.items) } catch (_) {}
          }
          setDoc(q)
        }
      } catch (err) {
        console.error('Failed to load production order for print', err)
      }
    })()
  }, [poID, poNo])

  useEffect(() => {
    const soId = doc?.sales_orderID || doc?.sales_order_id
    if (!soId) return
    ;(async () => {
      try {
        const res = await fetch(`/api/sales-orders?id=${encodeURIComponent(String(soId))}`)
        const j = await res.json().catch(() => null)
        if (res.ok && j?.success && j?.order) {
          const so = j.order
          setSalesOrder(so)
          // If SO doesn't have customer_name, fetch from customers table using cusID
          const cusId = so.cusID || so.cus_id
          if (cusId && !so.customer_name) {
            try {
              const cr = await fetch(`/api/customers?id=${encodeURIComponent(String(cusId))}`)
              const cj = await cr.json().catch(() => null)
              if (cr.ok && cj?.success && cj?.customer) {
                setCustomerDetail(cj.customer)
              }
            } catch (e) {
              console.error('Failed to load customer detail', e)
            }
          }
        }
      } catch (e) {
        console.error('Failed to load sales order for delivery customer info', e)
      }
    })()
  }, [doc?.sales_orderID, doc?.sales_order_id])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('k_system_admin_user')
      if (raw) {
        const u = JSON.parse(raw)
        setLoggedUser(u?.name || u?.fullname || u?.username || String(u?.userId || ''))
      }
    } catch {}
    const key = `print_count:production-order:${poID || poNo || 'unknown'}`
    setPrintCount(parseInt(localStorage.getItem(key) || '0', 10) || 0)
    setLastPrinted(localStorage.getItem(key + ':last') || null)
    const onAfter = () => {
      try {
        const newCnt = (parseInt(localStorage.getItem(key) || '0', 10) || 0) + 1
        const ts = new Date().toISOString()
        localStorage.setItem(key, String(newCnt))
        localStorage.setItem(key + ':last', ts)
        setPrintCount(newCnt)
        setLastPrinted(ts)
      } catch (e) { console.error('print count update error', e) }
    }
    ;(window as any).onafterprint = onAfter
    return () => { try { (window as any).onafterprint = null } catch (_) {} }
  }, [poID, poNo])

  useEffect(() => {
    if (doc && (auto === '1' || auto === 'true')) {
      setTimeout(() => { try { window.print() } catch (e) { console.error(e) } }, 300)
    }
  }, [doc, auto])

  if (!hydrated) return <div style={{ padding: 20 }}>Loading...</div>
  if (!poID && !poNo) return <div style={{ padding: 20 }}>Missing poID or poNo</div>
  if (!doc) return <div style={{ padding: 20 }}>Loading...</div>

  const updateQueryStringParameter = (uri: string, key: string, value: string) => {
    try {
      const url = new URL(uri)
      url.searchParams.set(key, value)
      return url.toString()
    } catch (e) { return uri }
  }

  const L = (en: string, th: string) => selectedLang === 'th' ? th : en
  const fmtDate = (v: any) => {
    if (!v) return '-'
    const d = new Date(v)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleDateString(selectedLang === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const productName = doc.product_name || doc.product || '-'
  const productCode = doc.product_code || '-'
  const productionLine = doc.production_line || doc.line || '-'
  const shift = doc.shift || '-'
  const priority = doc.priority || '-'
  const supervisor = doc.supervisor || doc.supervisedBy || '-'
  const targetQty = doc.quantity_ordered || doc.target_qty || doc.quantity || '-'
  const unit = doc.unit || 'pcs'
  const createdBy = doc.created_by || '-'
  const reference = salesOrder?.orderNo || doc.so_no || doc.sales_order_no || (doc.sales_orderID ? `SO-${String(doc.sales_orderID).padStart(6, '0')}` : '-')
  const notes = doc.notes || '-'
  const isBlank = (v: any) => !v || String(v).trim() === '' || String(v).trim() === '-'
  const manufacturerName = isBlank(doc.manufacturer_name) ? 'Zera co.,Ltd' : doc.manufacturer_name
  const manufacturerTaxId = isBlank(doc.manufacturer_tax_id) ? '831-87-03154' : doc.manufacturer_tax_id
  const manufacturerAddress = isBlank(doc.manufacturer_address) ? '2F, 16-10, 166beon-gil\nElseso-ro, Gunpo-si\nGyeonggi-do, Korea' : doc.manufacturer_address
  const cusAddrParts = customerDetail ? [
    customerDetail.house_number, customerDetail.moo ? `ม.${customerDetail.moo}` : '',
    customerDetail.tambon, customerDetail.amphoe, customerDetail.province, customerDetail.postcode
  ].filter(Boolean).join(' ') : ''
  const deliveryCustomerName = salesOrder?.customer_name || customerDetail?.fullname || customerDetail?.company || doc.customer_name || '-'
  const deliveryCustomerTaxId = salesOrder?.customer_tax_id || customerDetail?.tax_id || doc.customer_tax_id || '-'
  const deliveryCustomerPhone = salesOrder?.customer_phone || customerDetail?.phone || doc.customer_phone || '-'
  const deliveryCustomerAddress = salesOrder?.customer_address || cusAddrParts || doc.customer_address || doc.address || '-'
  const deliveryDate = salesOrder?.delivery_date || '-'
  const items = Array.isArray(doc.items) && doc.items.length > 0
    ? doc.items
    : [{ description: productName, quantity: targetQty, unit }]

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 10mm 12mm; }
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; overflow: hidden !important; }
          html, body { -ms-overflow-style: none !important; scrollbar-width: none !important; }
          ::-webkit-scrollbar { display: none !important; }
          .a4-page {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            min-height: auto !important;
            font-size: 10pt !important;
          }
          .header-row { margin-bottom: 10px !important; padding-bottom: 8px !important; }
          .company-name { font-size: 15pt !important; margin-bottom: 2px !important; }
          .company-name-en { font-size: 10pt !important; margin-bottom: 2px !important; }
          .company-address { font-size: 8.2pt !important; line-height: 1.35 !important; }
          .doc-title h1 { font-size: 18pt !important; margin-bottom: 2px !important; }
          .doc-title h2 { font-size: 11pt !important; }
          .info-section { gap: 10px !important; margin-bottom: 10px !important; }
          .info-box, .to-box, .customer-box, .note-box { padding: 8px 10px !important; margin-bottom: 8px !important; }
          .info-box-title, .to-title, .customer-title, .note-title { font-size: 9pt !important; margin-bottom: 4px !important; }
          .info-row { font-size: 8.8pt !important; margin-bottom: 2px !important; }
          .info-label { width: 88px !important; }
          .note-value { font-size: 8.8pt !important; min-height: 14px !important; }
          .items-table { margin-bottom: 8px !important; font-size: 8.8pt !important; }
          .items-table th, .items-table td { padding: 5px 6px !important; }
          .signature-section { margin-top: 12px !important; padding-top: 10px !important; }
          .signature-line { height: 30px !important; margin-bottom: 4px !important; }
          .signature-label { font-size: 8.8pt !important; }
          .signature-sublabel { font-size: 8pt !important; }
          .footer-info {
            position: fixed !important;
            bottom: 8mm !important;
            left: 12mm !important;
            right: 12mm !important;
            margin-top: 0 !important;
            padding-top: 6px !important;
            font-size: 7.5pt !important;
          }
        }
        @media screen { body { background: #e5e5e5; overflow-y: auto; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
        html { -ms-overflow-style: none; scrollbar-width: none; }
        .a4-page { width: 100%; max-width: 190mm; min-height: 297mm; margin: 10mm auto; padding: 10mm 12mm; background: white; font-family: 'Sarabun', 'Segoe UI', sans-serif; font-size: 11pt; line-height: 1.4; color: #333; box-shadow: 0 2px 8px rgba(0,0,0,0.15); position: relative; }
        .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #16a34a; }
        .company-info { flex: 1; }
        .company-name { font-size: 18pt; font-weight: 700; color: #16a34a; margin-bottom: 4px; }
        .company-name-en { font-size: 11pt; font-weight: 600; color: #333; margin-bottom: 6px; }
        .company-address { font-size: 9pt; color: #666; line-height: 1.5; }
        .doc-title { text-align: right; }
        .doc-title h1 { font-size: 22pt; font-weight: 700; color: #0ea5e9; margin: 0 0 4px 0; }
        .doc-title h2 { font-size: 14pt; font-weight: 600; color: #666; margin: 0; }
        .info-section { display: flex; gap: 20px; margin-bottom: 16px; }
        .info-box { flex: 1; border: 1px solid #ddd; border-radius: 6px; padding: 10px 12px; background: #fafafa; }
        .info-box-title { font-weight: 700; font-size: 10pt; color: #16a34a; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
        .info-row { display: flex; margin-bottom: 4px; font-size: 10pt; }
        .info-label { width: 100px; font-weight: 600; color: #555; }
        .info-value { flex: 1; color: #333; }
        .to-box { margin-bottom: 14px; border: 1px solid #ddd; border-radius: 6px; padding: 10px 12px; background: #f8fafc; }
        .to-title { font-weight: 700; font-size: 10pt; color: #0ea5e9; margin-bottom: 6px; }
        .customer-box { margin-bottom: 14px; border: 1px solid #ddd; border-radius: 6px; padding: 10px 12px; background: #fff7ed; }
        .customer-title { font-weight: 700; font-size: 10pt; color: #ea580c; margin-bottom: 6px; }
        .note-box { margin-bottom: 14px; border: 1px solid #ddd; border-radius: 6px; padding: 10px 12px; background: #fafafa; }
        .note-title { font-weight: 700; font-size: 10pt; color: #16a34a; margin-bottom: 6px; }
        .note-value { white-space: pre-wrap; font-size: 10pt; color: #333; min-height: 24px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 10pt; }
        .items-table th { background: #0ea5e9; color: white; padding: 8px 10px; text-align: left; font-weight: 600; }
        .items-table th:nth-child(1) { width: 40px; text-align: center; }
        .items-table th:nth-child(3) { width: 110px; text-align: right; white-space: nowrap; padding-right: 14px; }
        .items-table td { padding: 8px 10px; border-bottom: 1px solid #eee; }
        .items-table td:nth-child(1) { text-align: center; }
        .items-table td:nth-child(3) { text-align: right; white-space: nowrap; padding-right: 14px; }
        .items-table tbody tr:nth-child(even) { background: #f9f9f9; }
        .signature-section { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; }
        .signature-box { width: 30%; text-align: center; }
        .signature-line { border-bottom: 1px solid #333; height: 40px; margin-bottom: 8px; }
        .signature-label { font-size: 10pt; font-weight: 600; color: #333; }
        .signature-sublabel { font-size: 9pt; color: #666; }
        .footer-info { position: absolute; bottom: 10mm; left: 15mm; right: 15mm; display: flex; justify-content: space-between; font-size: 8pt; color: #999; border-top: 1px solid #eee; padding-top: 8px; }
      `}</style>


        <PrintStyles />
        <div className="no-print" style={{ textAlign: 'center', padding: '12px', background: '#f0f0f0' }}>
          <button
            onClick={() => { setSelectedLang('th'); window.history.replaceState(null, '', updateQueryStringParameter(window.location.href, 'lang', 'th')) }}
            style={{ marginRight: 8, padding: '6px 16px', fontSize: 13, borderRadius: 20, border: selectedLang === 'th' ? '2px solid #e67e22' : '1px solid #ccc', background: selectedLang === 'th' ? '#fff5eb' : '#fff', cursor: 'pointer', fontWeight: selectedLang === 'th' ? 600 : 400 }}
          >ไทย</button>
          <button
            onClick={() => { setSelectedLang('en'); window.history.replaceState(null, '', updateQueryStringParameter(window.location.href, 'lang', 'en')) }}
            style={{ marginRight: 8, padding: '6px 16px', fontSize: 13, borderRadius: 20, border: selectedLang === 'en' ? '2px solid #e67e22' : '1px solid #ccc', background: selectedLang === 'en' ? '#fff5eb' : '#fff', cursor: 'pointer', fontWeight: selectedLang === 'en' ? 600 : 400 }}
          >English</button>
          <button
            onClick={() => window.print()}
            style={{ marginLeft: 16, padding: '6px 20px', fontSize: 13, borderRadius: 20, border: '1px solid #e67e22', background: '#e67e22', color: 'white', cursor: 'pointer', fontWeight: 600 }}
          >{L('Print', 'พิมพ์')}</button>
        </div>

      <div className="a4-page">
        <div className="header-row">
          <div className="company-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/k-energy-save-logo.jpg" alt="Logo" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'contain', background: '#fff', padding: 4, border: '1px solid #ddd' }} />
              <div>
                <div className="company-name">{L('K Energy Save', 'เค อีเนอร์ยี่ เซฟ')}</div>
                <div className="company-name-en">{L('K Energy Save Co., Ltd.', 'บริษัท เค อีเนอร์ยี่ เซฟ จำกัด')}</div>
              </div>
            </div>
            <div className="company-address" style={{ marginTop: 8 }}>
              84 Chaloem Phrakiat Rama 9 Soi 34, Nong Bon, Prawet, Bangkok 10250<br/>
              Tel: 02-080-8916 | Email: info@kenergysave.com
            </div>
          </div>
          <div className="doc-title">
            <h1>{L('PRODUCTION ORDER', 'ใบสั่งผลิต')}</h1>
            <h2>{L('Manufacturing Order', 'เอกสารสั่งผลิต')}</h2>
          </div>
        </div>

        <div className="info-section">
          <div className="info-box">
            <div className="info-box-title">{L('Production Order Information', 'ข้อมูลใบสั่งผลิต')}</div>
            <div className="info-row">
              <span className="info-label">{L('PDO No:', 'เลขที่ PDO:')}</span>
              <span className="info-value" style={{ fontWeight: 700 }}>{doc.pdoNo || doc.poNo || doc.po_no || '-'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Date:', 'วันที่:')}</span>
              <span className="info-value">{fmtDate(doc.pdoDate || doc.poDate || doc.date)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Start Date:', 'วันเริ่ม:')}</span>
              <span className="info-value">{fmtDate(doc.start_date || doc.startDate)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Due Date:', 'กำหนดเสร็จ:')}</span>
              <span className="info-value">{fmtDate(doc.due_date || doc.dueDate)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Status:', 'สถานะ:')}</span>
              <span className="info-value" style={{ color: doc.status === 'completed' ? '#16a34a' : '#666' }}>{doc.status || 'pending'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Created By:', 'ผู้สร้าง:')}</span>
              <span className="info-value">{createdBy}</span>
            </div>
          </div>
          <div className="info-box">
            <div className="info-box-title">{L('Production Details', 'รายละเอียดการผลิต')}</div>
            <div className="info-row">
              <span className="info-label">{L('Line:', 'สายการผลิต:')}</span>
              <span className="info-value">{productionLine}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Supervisor:', 'หัวหน้างาน:')}</span>
              <span className="info-value">{supervisor}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Shift:', 'กะ:')}</span>
              <span className="info-value">{shift}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('Priority:', 'ความสำคัญ:')}</span>
              <span className="info-value">{priority}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{L('SO Ref:', 'อ้างอิง SO:')}</span>
              <span className="info-value">{reference}</span>
            </div>
          </div>
        </div>

        <div className="to-box">
          <div className="to-title">{L('Manufacturer Information', 'ข้อมูลผู้ผลิต')}</div>
          <div className="info-row">
            <span className="info-label">{L('Manufacturer:', 'ผู้ผลิต:')}</span>
            <span className="info-value" style={{ fontWeight: 600 }}>{manufacturerName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">{L('Tax ID:', 'เลขผู้เสียภาษี:')}</span>
            <span className="info-value">{manufacturerTaxId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">{L('Address:', 'ที่อยู่:')}</span>
            <span className="info-value" style={{ whiteSpace: 'pre-line' }}>{manufacturerAddress}</span>
          </div>
        </div>

        <div className="customer-box">
          <div className="customer-title">{L('Delivery Customer Information', 'ข้อมูลลูกค้าที่ต้องจัดส่ง')}</div>
          <div className="info-row">
            <span className="info-label">{L('Customer:', 'ลูกค้า:')}</span>
            <span className="info-value" style={{ fontWeight: 600 }}>{deliveryCustomerName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">{L('Tax ID:', 'เลขผู้เสียภาษี:')}</span>
            <span className="info-value">{deliveryCustomerTaxId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">{L('Phone:', 'โทรศัพท์:')}</span>
            <span className="info-value">{deliveryCustomerPhone}</span>
          </div>
          <div className="info-row">
            <span className="info-label">{L('Address:', 'ที่อยู่จัดส่ง:')}</span>
            <span className="info-value">{deliveryCustomerAddress}</span>
          </div>
          <div className="info-row">
            <span className="info-label">{L('Delivery Date:', 'วันที่จัดส่ง:')}</span>
            <span className="info-value">{fmtDate(deliveryDate)}</span>
          </div>
        </div>

        <div className="note-box">
          <div className="note-title">{L('Notes', 'หมายเหตุ')}</div>
          <div className="note-value">{notes}</div>
        </div>

        <table className="items-table">
          <thead>
            <tr>
              <th>{L('No.', 'ลำดับ')}</th>
              <th>{L('Description', 'รายการ')}</th>
              <th>{L('Qty', 'จำนวน')}</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: '#999', padding: 20 }}>-</td></tr>
            ) : items.map((it: any, idx: number) => {
              const rawQty = it.quantity || it.qty || targetQty
              const qtyNum = parseFloat(String(rawQty))
              const qtyDisplay = !isNaN(qtyNum) ? qtyNum.toFixed(2) : (rawQty || '-')
              const itemUnit = it.unit || unit || ''
              const desc = it.description || it.product_name || it.desc || productName || '-'
              return (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{desc}</td>
                  <td>{`${qtyDisplay}${itemUnit ? ` ${itemUnit}` : ''}`}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Prepared By', 'ผู้จัดทำ')}</div>
            <div className="signature-sublabel">{L('Planning', 'ฝ่ายวางแผน')}</div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Supervisor', 'หัวหน้างาน')}</div>
            <div className="signature-sublabel">{L('Production', 'ฝ่ายผลิต')}</div>
          </div>
          <div className="signature-box">
            <div className="signature-line"></div>
            <div className="signature-label">{L('Approved By', 'ผู้อนุมัติ')}</div>
            <div className="signature-sublabel">{L('Manager', 'ผู้จัดการ')}</div>
          </div>
        </div>

        <div className="footer-info">
          <span>{L('User:', 'ผู้พิมพ์:')} {loggedUser || '-'}</span>
          <span>{L('Printed:', 'พิมพ์เมื่อ:')} {new Date(lastPrinted || new Date()).toLocaleString(selectedLang === 'th' ? 'th-TH' : 'en-US')}</span>
          <span>{L('Print Count:', 'ครั้งที่พิมพ์:')} {printCount + 1}</span>
        </div>
      </div>
    </>
  )
}

export default function ProductionOrderPrintPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>Loading...</div>}>
      <ProductionOrderPrintContent />
    </Suspense>
  )
}
