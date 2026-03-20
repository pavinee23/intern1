"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AccWindow, { useLang } from '../components/AccWindow'

/* ── Module tiles ─────────────────────────────────────────────── */
const MODULES = [
  { icon: '🛒', th: 'ซื้อ',         en: 'Purchase',   href: '/Thailand/Accounting-Login/purchase/order',    color: '#1f2937', bg: '#f0f1f3' },
  { icon: '💰', th: 'ขาย',          en: 'Sales',       href: '/Thailand/Accounting-Login/sales/order',       color: '#1f2937', bg: '#f0f1f3' },
  { icon: '🏦', th: 'การเงิน',      en: 'Finance',     href: '/Thailand/Accounting-Login/finance/receive',   color: '#1f2937', bg: '#f0f1f3' },
  { icon: '📦', th: 'สินค้า',       en: 'Inventory',   href: '/Thailand/Accounting-Login/inventory/receive', color: '#1f2937', bg: '#f0f1f3' },
  { icon: '📒', th: 'บัญชี',        en: 'Accounting',  href: '/Thailand/Accounting-Login/accounting/journal',color: '#1f2937', bg: '#f0f1f3' },
  { icon: '📊', th: 'รายงาน',       en: 'Reports',     href: '/Thailand/Accounting-Login/reports/purchase',  color: '#1f2937', bg: '#f0f1f3' },
  { icon: '⚙️', th: 'ตั้งค่า',      en: 'Settings',    href: '/Thailand/Accounting-Login/settings',          color: '#1f2937', bg: '#f0f1f3' },
  { icon: '🔐', th: 'ออกจากระบบ',  en: 'Logout',      href: '/Thailand/Accounting-Login',                   color: '#4b5563', bg: '#e5e7eb' },
]

/* ── Quick-access buttons ─────────────────────────────────────── */
const QUICK = [
  { th: 'ซื้อเงินสด',   en: 'Cash Purchase', href: '/Thailand/Accounting-Login/purchase/cash',     icon: '\uD83D\uDED2' },
  { th: 'ขายเงินสด',    en: 'Cash Sale',      href: '/Thailand/Accounting-Login/sales/cash',        icon: '\uD83D\uDCB0' },
  { th: 'ขายเชื่อ',     en: 'Credit Sale',    href: '/Thailand/Accounting-Login/sales/credit',      icon: '\uD83D\uDCB3' },
  { th: 'รับชำระ',      en: 'Receive Pymt',  href: '/Thailand/Accounting-Login/finance/receive',   icon: '\uD83D\uDCE5' },
  { th: 'จ่ายชำระ',     en: 'Make Payment',  href: '/Thailand/Accounting-Login/finance/pay',       icon: '\uD83D\uDCE4' },
  { th: 'รับสินค้า',    en: 'Receive Goods', href: '/Thailand/Accounting-Login/inventory/receive', icon: '\uD83D\uDCE6' },
  { th: 'บันทึกบัญชี',  en: 'Journal Entry', href: '/Thailand/Accounting-Login/accounting/journal',icon: '\uD83D\uDCD3' },
  { th: 'งบดุล',        en: 'Balance Sheet', href: '/Thailand/Accounting-Login/balance-sheet',     icon: '\uD83D\uDCCB' },
  { th: 'สแกนบิล',      en: 'Scan Bill',     href: '/Thailand/Accounting-Login/purchase/scan-bill',icon: '\uD83D\uDCF7' },
]

/* ── Dashboard page ───────────────────────────────────────────── */
export default function AccountingDashboardPage() {
  const [username, setUsername] = useState('')
  const [fullname, setFullname] = useState('')
  const [hover, setHover] = useState<number | null>(null)
  const [quickHover, setQuickHover] = useState<number | null>(null)
  const router = useRouter()
  const { L } = useLang()

  useEffect(() => {
    try {
      setUsername(localStorage.getItem('username') || '')
      setFullname(localStorage.getItem('fullname') || '')
    } catch (_) {}
  }, [])

  const dateLong = new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const dateShort = new Date().toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <AccWindow title="บริษัท เค เอ็นเนอร์จี เซฟ จำกัด">
      <div style={{ padding: 20, minHeight: '100%' }}>

        {/* Welcome card */}
        <div style={{
          background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #6b7280 100%)',
          borderRadius: 12,
          padding: '26px 30px',
          marginBottom: 22,
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 6px 20px rgba(45,55,72,0.35)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 5, textShadow: '0 1px 3px rgba(0,0,0,0.3)', letterSpacing: '0.01em' }}>
              {L('Welcome back', 'ยินดีต้อนรับ')}, {fullname || username || 'User'}
            </div>
            <div style={{ fontSize: 14, opacity: 0.85, fontWeight: 500 }}>
              {L('Company: ', 'บริษัท: ')}เค เอ็นเนอร์จี เซฟ จำกัด
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{dateLong}</div>
          </div>
        </div>

        {/* Section label */}
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', marginBottom: 12, letterSpacing: '0.01em' }}>
          {L('Main Modules', 'เมนูหลัก')}
        </div>

        {/* Module grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12, marginBottom: 24 }}>
          {MODULES.map((m, i) => (
            <div
              key={i}
              onClick={() => router.push(m.href)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '20px 8px 16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: hover === i ? '0 10px 28px rgba(0,0,0,0.15)' : '0 2px 6px rgba(0,0,0,0.08)',
                transform: hover === i ? 'translateY(-4px)' : 'none',
                border: `1px solid ${hover === i ? '#9ca3af' : '#d1d5db'}`,
                userSelect: 'none',
              }}
            >
              <div style={{
                width: 50, height: 50, borderRadius: 12, background: m.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px', fontSize: 26,
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>{m.icon}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: m.color, lineHeight: 1.3 }}>
                {L(m.en, m.th)}
              </div>
            </div>
          ))}
        </div>

        {/* Section label */}
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', marginBottom: 12, letterSpacing: '0.01em' }}>
          {L('Quick Access', 'ทางลัดที่ใช้บ่อย')}
        </div>

        {/* Quick access */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 18,
          marginBottom: 20,
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          border: '1px solid #d1d5db',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {QUICK.map((q, i) => (
              <button
                key={i}
                onClick={() => router.push(q.href)}
                onMouseEnter={() => setQuickHover(i)}
                onMouseLeave={() => setQuickHover(null)}
                style={{
                  padding: '9px 18px',
                  background: quickHover === i ? '#4b5563' : '#f3f4f6',
                  color: quickHover === i ? '#fff' : '#1f2937',
                  border: quickHover === i ? '1px solid #4b5563' : '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: '"Sarabun","Tahoma",sans-serif',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: quickHover === i ? '0 2px 8px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: 16 }}>{q.icon}</span>
                {L(q.en, q.th)}
              </button>
            ))}
          </div>
        </div>

        {/* Info footer */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '16px 22px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          border: '1px solid #d1d5db',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 13,
          color: '#6b7280',
          fontWeight: 500,
        }}>
          <div>
            <div>{L('Data Storage: ', 'ที่เก็บข้อมูล: ')}<span style={{ fontWeight: 600, color: '#4b5563' }}>Server {L('Head Office Korea', 'สำนักงานใหญ่เกาหลี')}</span> &middot; MySQL</div>
            <div style={{ marginTop: 3 }}>K-Energy-TH 2025</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div>{L('Working Date: ', 'วันที่ทำการ: ')}<span style={{ fontWeight: 600, color: '#4b5563' }}>{dateShort}</span></div>
            <div style={{ marginTop: 3 }}>{L('User: ', 'ผู้ใช้: ')}<span style={{ fontWeight: 600, color: '#4b5563' }}>{fullname || username || 'USER'}</span></div>
          </div>
        </div>

      </div>
    </AccWindow>
  )
}
