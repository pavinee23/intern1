"use client"

import React, { useState } from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'

export default function CalculatePayrollPage() {
  const { L } = useLang()
  const [period, setPeriod] = useState('')

  return (
    <AccWindow title={L('บริษัท เค เอ็นเนอร์จี เซฟ จำกัด', 'K Energy Save Co., Ltd.')}>
      <div style={{ padding: 30 }}>
        <div style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
          color: '#fff'
        }}>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            🧮 {L('Calculate Payroll', 'คำนวณเงินเดือน')}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 30, border: '2px solid #e5e7eb' }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
              {L('Payroll Period', 'งวดเงินเดือน')}
            </label>
            <input
              type="month"
              value={period}
              onChange={e => setPeriod(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 14,
                border: '2px solid #e5e7eb',
                borderRadius: 8
              }}
            />
          </div>

          <button style={{
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            width: '100%'
          }}>
            {L('Calculate', 'คำนวณ')}
          </button>
        </div>
      </div>
    </AccWindow>
  )
}
