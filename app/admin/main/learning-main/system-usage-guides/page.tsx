"use client"

import Link from 'next/link'

const branchSections = [
  {
    key: 'korea-hq',
    branch: 'Korea HQ',
    links: [
      { label: 'Korea Admin Login', href: '/Korea/Admin-Login' },
      { label: 'Learning Login', href: '/admin/main/learning-login' },
      { label: 'Marketing Login', href: '/admin/main/marketing-login' },
      { label: 'Smart Farm Login', href: '/admin/main/smart-farm-login' }
    ]
  },
  {
    key: 'thailand-branch',
    branch: 'Thailand Branch',
    links: [
      { label: 'Thailand Admin Login', href: '/KR-Thailand/Admin-Login' },
      { label: 'Thailand Accounting Login', href: '/KR-Thailand/Accounting-Login' },
      { label: 'Thailand Marketing Login', href: '/KR-Thailand/Marketing-Login' },
      { label: 'Learning Login', href: '/admin/main/learning-login' }
    ]
  },
  {
    key: 'vietnam-branch',
    branch: 'Vietnam Branch',
    links: [
      { label: 'Vietnam Invoices List', href: '/KR-Vietnam/Admin-Login/invoices/list' },
      { label: 'Vietnam Create Invoice', href: '/KR-Vietnam/Admin-Login/invoices/create' },
      { label: 'Vietnam Korea Invoices', href: '/KR-Vietnam/Admin-Login/korea-invoices' }
    ]
  },
  {
    key: 'malaysia-branch',
    branch: 'Malaysia Branch',
    links: [
      { label: 'Malaysia Invoices List', href: '/KR-Malaysia/Admin-Login/invoices/list' },
      { label: 'Malaysia Create Invoice', href: '/KR-Malaysia/Admin-Login/invoices/create' },
      { label: 'Malaysia Korea Invoices', href: '/KR-Malaysia/Admin-Login/korea-invoices' }
    ]
  },
  {
    key: 'brunei-branch',
    branch: 'Brunei Branch',
    links: [
      { label: 'Brunei Invoices List', href: '/KR-Brunei/Admin-Login/invoices/list' },
      { label: 'Brunei Create Invoice', href: '/KR-Brunei/Admin-Login/invoices/create' },
      { label: 'Brunei Korea Invoices', href: '/KR-Brunei/Admin-Login/korea-invoices' }
    ]
  }
]

export default function SystemUsageGuidesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
          คู่มือการใช้ระบบ ของแต่ละแผนก แต่ละสาขา
        </h1>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>
          แยกเป็นแต่ละสาขาก่อนให้ครบ และเลือกเข้าระบบตามสิทธิ์ของผู้ใช้งาน
        </p>

        <div style={{ display: 'grid', gap: 14 }}>
          {branchSections.map((section) => (
            <div id={section.key} key={section.branch} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 10 }}>{section.branch}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10 }}>
                {section.links.map((item) => (
                  <Link
                    key={`${section.branch}-${item.href}-${item.label}`}
                    href={item.href}
                    style={{
                      textDecoration: 'none',
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      borderRadius: 10,
                      padding: '12px 14px',
                      fontWeight: 700,
                      color: '#1f2937'
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
