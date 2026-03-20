"use client"

import React, { useState } from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'

const SAMPLE_EMPLOYEES = [
  { id: 'E001', name: 'สมชาย ใจดี', department: 'บัญชี', position: 'นักบัญชี', salary: 25000, status: 'active' },
  { id: 'E002', name: 'สมหญิง รักดี', department: 'การตลาด', position: 'Marketing Manager', salary: 35000, status: 'active' },
  { id: 'E003', name: 'วิชัย สุขใจ', department: 'ช่าง', position: 'ช่างติดตั้ง', salary: 18000, status: 'active' },
  { id: 'E004', name: 'มานะ ขยัน', department: 'IT', position: 'โปรแกรมเมอร์', salary: 30000, status: 'active' },
]

export default function EmployeesPage() {
  const { L } = useLang()
  const [employees] = useState(SAMPLE_EMPLOYEES)
  const [search, setSearch] = useState('')

  const filtered = employees.filter(e =>
    e.name.includes(search) || e.id.includes(search) || e.department.includes(search)
  )

  return (
    <AccWindow title={L('บริษัท เค เอ็นเนอร์จี เซฟ จำกัด', 'K Energy Save Co., Ltd.')}>
      <div style={{ padding: 30 }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>
              👥 {L('Employee Data', 'ข้อมูลพนักงาน')}
            </div>
            <div style={{ fontSize: 14, marginTop: 4, opacity: 0.9 }}>
              {L('Total Employees', 'พนักงานทั้งหมด')}: {employees.length} {L('people', 'คน')}
            </div>
          </div>
          <button style={{
            padding: '10px 20px',
            background: '#fff',
            color: '#4f46e5',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            cursor: 'pointer'
          }}>
            ➕ {L('Add Employee', 'เพิ่มพนักงาน')}
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            placeholder={L('Search employees...', 'ค้นหาพนักงาน...')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: 14,
              border: '2px solid #e5e7eb',
              borderRadius: 8,
              outline: 'none'
            }}
          />
        </div>

        {/* Employee Table */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          border: '2px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, color: '#374151' }}>
                  {L('ID', 'รหัส')}
                </th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, color: '#374151' }}>
                  {L('Name', 'ชื่อ-นามสกุล')}
                </th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, color: '#374151' }}>
                  {L('Department', 'แผนก')}
                </th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, color: '#374151' }}>
                  {L('Position', 'ตำแหน่ง')}
                </th>
                <th style={{ padding: 16, textAlign: 'right', fontWeight: 700, color: '#374151' }}>
                  {L('Salary', 'เงินเดือน')}
                </th>
                <th style={{ padding: 16, textAlign: 'center', fontWeight: 700, color: '#374151' }}>
                  {L('Actions', 'จัดการ')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => (
                <tr key={emp.id} style={{
                  borderBottom: i < filtered.length - 1 ? '1px solid #e5e7eb' : 'none',
                  transition: 'background 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: 16, fontWeight: 600, color: '#6366f1' }}>{emp.id}</td>
                  <td style={{ padding: 16, fontWeight: 600 }}>{emp.name}</td>
                  <td style={{ padding: 16 }}>{emp.department}</td>
                  <td style={{ padding: 16 }}>{emp.position}</td>
                  <td style={{ padding: 16, textAlign: 'right', fontWeight: 600 }}>
                    ฿{emp.salary.toLocaleString()}
                  </td>
                  <td style={{ padding: 16, textAlign: 'center' }}>
                    <button style={{
                      padding: '6px 12px',
                      background: '#eff6ff',
                      color: '#3b82f6',
                      border: '1px solid #3b82f6',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginRight: 8
                    }}>
                      {L('Edit', 'แก้ไข')}
                    </button>
                    <button style={{
                      padding: '6px 12px',
                      background: '#fef2f2',
                      color: '#ef4444',
                      border: '1px solid #ef4444',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                      {L('Delete', 'ลบ')}
                    </button>
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
