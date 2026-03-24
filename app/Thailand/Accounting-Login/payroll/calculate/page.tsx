"use client"

import React, { useEffect, useState } from 'react'
import AccWindow, { useLang } from '../../components/AccWindow'

type EmployeeOption = {
  id: number
  username: string
  name: string
  name_th?: string
  typeID?: number
  department: string
  position: string
  salary?: number
  hourlyRate?: number
  dailyRate?: number
}

type PayrollForm = {
  employeeCode: string
  employeeName: string
  position: string
  department: string
  period: string
  accumulatedIncome: number
  accumulatedSocialSecurity: number
  accumulatedTax: number
  accumulatedProvidentFund: number
  salary: number
  bonus: number
  positionAllowance: number
  overtime: number
  commission: number
  healthInsurance: number
  incomeTax: number
  socialSecurity: number
  providentFund: number
  absentLateDeduction: number
  uniformDeduction: number
  advanceDeduction: number
  preparedBy: string
  approvedBy: string
  documentDate: string
}

const defaultForm = (): PayrollForm => ({
  employeeCode: '',
  employeeName: '',
  position: '',
  department: '',
  period: '',
  accumulatedIncome: 0,
  accumulatedSocialSecurity: 0,
  accumulatedTax: 0,
  accumulatedProvidentFund: 0,
  salary: 0,
  bonus: 0,
  positionAllowance: 0,
  overtime: 0,
  commission: 0,
  healthInsurance: 0,
  incomeTax: 0,
  socialSecurity: 0,
  providentFund: 0,
  absentLateDeduction: 0,
  uniformDeduction: 0,
  advanceDeduction: 0,
  preparedBy: '',
  approvedBy: 'กรรมการและผู้จัดการฝ่ายบริหาร',
  documentDate: new Date().toISOString().split('T')[0]
})

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 700,
  color: '#334155'
}

const textInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none'
}

const numberInputStyle: React.CSSProperties = {
  ...textInputStyle,
  textAlign: 'right'
}

function numberToThaiText(amount: number) {
  if (!Number.isFinite(amount) || amount === 0) return 'ศูนย์บาทถ้วน'

  const digitText = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
  const positionText = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน']

  const convertInteger = (value: number): string => {
    if (value === 0) return ''

    const valueText = String(value)
    let result = ''

    for (let i = 0; i < valueText.length; i += 1) {
      const digit = Number(valueText[i])
      const position = valueText.length - i - 1

      if (digit === 0) continue

      if (position >= 6) {
        const front = Math.floor(value / 1000000)
        const back = value % 1000000
        return `${convertInteger(front)}ล้าน${convertInteger(back)}`
      }

      if (position === 1) {
        if (digit === 1) {
          result += 'สิบ'
        } else if (digit === 2) {
          result += 'ยี่สิบ'
        } else {
          result += `${digitText[digit]}สิบ`
        }
      } else if (position === 0 && digit === 1 && valueText.length > 1) {
        result += 'เอ็ด'
      } else {
        result += `${digitText[digit]}${positionText[position]}`
      }
    }

    return result
  }

  const roundedAmount = Math.round(amount * 100) / 100
  const integerPart = Math.floor(roundedAmount)
  const decimalPart = Math.round((roundedAmount - integerPart) * 100)

  const bahtText = `${convertInteger(integerPart)}บาท`
  if (decimalPart === 0) return `${bahtText}ถ้วน`

  return `${bahtText}${convertInteger(decimalPart)}สตางค์`
}

export default function CalculatePayrollPage() {
  const { L } = useLang()
  const [mounted, setMounted] = useState(false)
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [form, setForm] = useState<PayrollForm>(defaultForm())

  useEffect(() => {
    setMounted(true)
    void loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const res = await fetch('/api/payroll/employees?site=Thailand')
      const data = await res.json()
      if (data.ok && Array.isArray(data.employees)) {
        setEmployees(data.employees as EmployeeOption[])
      }
    } catch (err) {
      console.error('Failed to load employees:', err)
    }
  }

  const updateForm = <K extends keyof PayrollForm>(field: K, value: PayrollForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const calculateSocialSecurity = (salary: number) => Math.min(salary * 0.05, 750)
  const calculateProvidentFund = (salary: number) => salary * 0.03

  const calculateIncomeTax = (salary: number) => {
    const yearlyIncome = salary * 12
    const taxableIncome = Math.max(yearlyIncome - 90000, 0)

    if (taxableIncome <= 150000) return 0
    if (taxableIncome <= 300000) return ((taxableIncome - 150000) * 0.05) / 12
    if (taxableIncome <= 500000) return (7500 + (taxableIncome - 300000) * 0.1) / 12
    if (taxableIncome <= 750000) return (27500 + (taxableIncome - 500000) * 0.15) / 12
    return (65000 + (taxableIncome - 750000) * 0.2) / 12
  }

  const getDefaultPositionAllowance = (typeID?: number) => {
    const allowanceByType: Record<number, number> = {
      2: 8000,
      3: 3000,
      6: 2500,
      8: 3500,
      10: 10000,
      11: 6000
    }
    return allowanceByType[typeID || 0] || 0
  }

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId)
    const employee = employees.find(item => item.id === Number(employeeId))
    if (!employee) return

    const baseSalary = Number(employee.salary || 0)
    const socialSecurity = calculateSocialSecurity(baseSalary)
    const providentFund = calculateProvidentFund(baseSalary)
    const incomeTax = calculateIncomeTax(baseSalary)

    setForm(prev => ({
      ...prev,
      employeeCode: `EMP-${String(employee.id).padStart(4, '0')}`,
      employeeName: employee.name_th || employee.name || '',
      position: employee.position || '',
      department: employee.department || '',
      salary: baseSalary,
      positionAllowance: getDefaultPositionAllowance(employee.typeID),
      socialSecurity,
      providentFund,
      incomeTax
    }))
  }

  const totalIncome =
    form.salary +
    form.bonus +
    form.positionAllowance +
    form.overtime +
    form.commission +
    form.healthInsurance

  const totalDeductions =
    form.incomeTax +
    form.socialSecurity +
    form.providentFund +
    form.absentLateDeduction +
    form.uniformDeduction +
    form.advanceDeduction

  const netIncome = totalIncome - totalDeductions

  const formattedPeriod = form.period
    ? new Date(`${form.period}-01`).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
    : '-'

  const handleGenerateSlip = () => {
    if (!form.employeeCode || !form.employeeName || !form.period) {
      alert(L('Please complete employee and period information', 'กรุณากรอกข้อมูลพนักงานและงวดสลิปเงินเดือนให้ครบ'))
      return
    }
    setShowResult(true)
  }

  const handlePrint = () => {
    window.print()
  }

  const formatMoney = (amount: number) =>
    amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (!mounted) {
    return (
      <AccWindow title={L('บริษัท เค เอ็นเนอร์จี เซฟ จำกัด', 'K Energy Save Co., Ltd.')}>
        <div style={{ padding: 30, textAlign: 'center', color: '#64748b' }}>กำลังโหลด...</div>
      </AccWindow>
    )
  }

  return (
    <AccWindow title={L('บริษัท เค เอ็นเนอร์จี เซฟ จำกัด', 'K Energy Save Co., Ltd.')}>
      <div style={{ padding: 24, maxWidth: 1280, margin: '0 auto' }}>
        {!showResult ? (
          <>
            <div style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #0f172a 100%)',
              borderRadius: 16,
              padding: '22px 26px',
              marginBottom: 20,
              color: 'white',
              boxShadow: '0 12px 30px rgba(15,23,42,0.18)'
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
                📄 {L('Payroll Slip Form', 'แบบฟอร์มสลิปเงินเดือน')}
              </div>
              <div style={{ fontSize: 14, opacity: 0.9 }}>
                {L('Complete salary details for monthly payslip generation', 'กรอกข้อมูลเพื่อจัดทำสลิปเงินเดือนประจำเดือน')}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #dbe4ee' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
                  {L('Employee Information', 'ข้อมูลพนักงาน')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
                  <div>
                    <label style={fieldLabelStyle}>{L('Employee', 'พนักงาน')}</label>
                    <select
                      value={selectedEmployee}
                      onChange={e => handleEmployeeChange(e.target.value)}
                      style={{ ...textInputStyle, textAlign: 'left' }}
                    >
                      <option value="">{L('Select employee', 'เลือกพนักงาน')}</option>
                      {employees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} ({employee.username})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Employee Code', 'รหัสพนักงาน')}</label>
                    <input value={form.employeeCode} onChange={e => updateForm('employeeCode', e.target.value)} style={textInputStyle} />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Full Name', 'ชื่อ-นามสกุล')}</label>
                    <input value={form.employeeName} onChange={e => updateForm('employeeName', e.target.value)} style={textInputStyle} />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Position', 'ตำแหน่ง')}</label>
                    <input value={form.position} onChange={e => updateForm('position', e.target.value)} style={textInputStyle} />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Department', 'ฝ่าย')}</label>
                    <input value={form.department} onChange={e => updateForm('department', e.target.value)} style={textInputStyle} />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Payslip Month', 'สลิปเงินเดือน ประจำเดือน')}</label>
                    <input
                      type="month"
                      value={form.period}
                      onChange={e => updateForm('period', e.target.value)}
                      style={{ ...textInputStyle, textAlign: 'left' }}
                    />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Document Date', 'วันที่')}</label>
                    <input
                      type="date"
                      value={form.documentDate}
                      onChange={e => updateForm('documentDate', e.target.value)}
                      style={{ ...textInputStyle, textAlign: 'left' }}
                    />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Prepared By', 'จัดทำโดย')}</label>
                    <input value={form.preparedBy} onChange={e => updateForm('preparedBy', e.target.value)} style={textInputStyle} />
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #dbe4ee' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
                  {L('Accumulated Totals', 'ยอดสะสม')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 14 }}>
                  <div>
                    <label style={fieldLabelStyle}>{L('Accumulated Income', 'เงินได้สะสม')}</label>
                    <input type="number" value={form.accumulatedIncome} onChange={e => updateForm('accumulatedIncome', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Accumulated Social Security', 'ประกันสังคมสะสม')}</label>
                    <input type="number" value={form.accumulatedSocialSecurity} onChange={e => updateForm('accumulatedSocialSecurity', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Accumulated Tax', 'ภาษีสะสม')}</label>
                    <input type="number" value={form.accumulatedTax} onChange={e => updateForm('accumulatedTax', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Accumulated Provident Fund', 'กองทุนสะสม')}</label>
                    <input type="number" value={form.accumulatedProvidentFund} onChange={e => updateForm('accumulatedProvidentFund', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <div style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #dbe4ee' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#15803d', marginBottom: 14 }}>
                    {L('Income Items', 'รายการรับ')}
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div>
                      <label style={fieldLabelStyle}>{L('Salary', 'เงินเดือน')}</label>
                      <input type="number" value={form.salary} onChange={e => updateForm('salary', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Bonus', 'โบนัส')}</label>
                      <input type="number" value={form.bonus} onChange={e => updateForm('bonus', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Position Allowance', 'ค่าตำแหน่ง')}</label>
                      <input type="number" value={form.positionAllowance} onChange={e => updateForm('positionAllowance', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Overtime', 'ค่าล่วงเวลา')}</label>
                      <input type="number" value={form.overtime} onChange={e => updateForm('overtime', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Commission', 'ค่าคอมมิชชั่น')}</label>
                      <input type="number" value={form.commission} onChange={e => updateForm('commission', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Health Insurance', 'ประกันสุขภาพ')}</label>
                      <input type="number" value={form.healthInsurance} onChange={e => updateForm('healthInsurance', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: 10, background: '#dcfce7', color: '#166534', fontWeight: 800 }}>
                      {L('Total Income', 'รวมรายรับ')}: {formatMoney(totalIncome)}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #dbe4ee' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#b91c1c', marginBottom: 14 }}>
                    {L('Deduction Items', 'รายการหัก')}
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div>
                      <label style={fieldLabelStyle}>{L('Income Tax', 'ภาษีเงินได้')}</label>
                      <input type="number" value={form.incomeTax} onChange={e => updateForm('incomeTax', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Social Security', 'เงินประกันสังคม')}</label>
                      <input type="number" value={form.socialSecurity} onChange={e => updateForm('socialSecurity', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Provident Fund', 'กองทุนสำรองเลี้ยงชีพ')}</label>
                      <input type="number" value={form.providentFund} onChange={e => updateForm('providentFund', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Absent / Leave / Late Deduction', 'หักขาด/ลา/มาสาย')}</label>
                      <input type="number" value={form.absentLateDeduction} onChange={e => updateForm('absentLateDeduction', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Uniform Deduction', 'หักชุดฟอร์ม')}</label>
                      <input type="number" value={form.uniformDeduction} onChange={e => updateForm('uniformDeduction', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div>
                      <label style={fieldLabelStyle}>{L('Advance Deduction', 'เบิกล่วงหน้า')}</label>
                      <input type="number" value={form.advanceDeduction} onChange={e => updateForm('advanceDeduction', parseFloat(e.target.value) || 0)} style={numberInputStyle} />
                    </div>
                    <div style={{ padding: '12px 14px', borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontWeight: 800 }}>
                      {L('Total Deductions', 'รวมรายการหัก')}: {formatMoney(totalDeductions)}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #dbe4ee' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'start' }}>
                  <div style={{ padding: '14px 16px', borderRadius: 10, background: '#ecfccb', color: '#365314', fontWeight: 800 }}>
                    {L('Net Income', 'รวมเงินได้สุทธิ')}<br />{formatMoney(netIncome)} {L('Baht', 'บาท')}
                  </div>
                  <div>
                    <label style={fieldLabelStyle}>{L('Net Income in Words', 'รวมตัวอักษร')}</label>
                    <div style={{ ...textInputStyle, minHeight: 46, background: '#f8fafc' }}>
                      {numberToThaiText(netIncome)}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleGenerateSlip}
                  style={{
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 10px 22px rgba(20,184,166,0.24)'
                  }}
                >
                  {L('Generate Payslip', 'สร้างสลิปเงินเดือน')}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #cbd5e1', padding: 28 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{L('Payslip', 'สลิปเงินเดือน')}</div>
              <div style={{ fontSize: 14, color: '#475569', marginTop: 6 }}>{formattedPeriod}</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13 }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700, width: '18%' }}>รหัสพนักงาน</td>
                  <td style={{ border: '1px solid #000', padding: 10 }}>{form.employeeCode || '-'}</td>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700, width: '18%' }}>สลิปเงินเดือน ประจำเดือน</td>
                  <td style={{ border: '1px solid #000', padding: 10 }}>{formattedPeriod}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700 }}>ชื่อ-นามสกุล</td>
                  <td style={{ border: '1px solid #000', padding: 10 }}>{form.employeeName || '-'}</td>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700 }}>ตำแหน่ง</td>
                  <td style={{ border: '1px solid #000', padding: 10 }}>{form.position || '-'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700 }}>ฝ่าย</td>
                  <td style={{ border: '1px solid #000', padding: 10 }}>{form.department || '-'}</td>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700 }}>วันที่</td>
                  <td style={{ border: '1px solid #000', padding: 10 }}>{form.documentDate || '-'}</td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13 }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700 }}>เงินได้สะสม</td>
                  <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right' }}>{formatMoney(form.accumulatedIncome)}</td>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700 }}>ประกันสังคมสะสม</td>
                  <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right' }}>{formatMoney(form.accumulatedSocialSecurity)}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700 }}>ภาษีสะสม</td>
                  <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right' }}>{formatMoney(form.accumulatedTax)}</td>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 700 }}>กองทุนสะสม</td>
                  <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right' }}>{formatMoney(form.accumulatedProvidentFund)}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th colSpan={2} style={{ border: '1px solid #000', padding: 10, background: '#dcfce7', fontWeight: 800 }}>รายการรับ</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['เงินเดือน', form.salary],
                    ['โบนัส', form.bonus],
                    ['ค่าตำแหน่ง', form.positionAllowance],
                    ['ค่าล่วงเวลา', form.overtime],
                    ['ค่าคอมมิชชั่น', form.commission],
                    ['ประกันสุขภาพ', form.healthInsurance],
                    ['รวมรายรับ', totalIncome]
                  ].map(([label, value], index) => (
                    <tr key={label}>
                      <td style={{ border: '1px solid #000', padding: 10, fontWeight: label === 'รวมรายรับ' ? 800 : 600 }}>{label}</td>
                      <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right', background: index === 6 ? '#f0fdf4' : '#fff', fontWeight: label === 'รวมรายรับ' ? 800 : 500 }}>
                        {formatMoney(Number(value))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th colSpan={2} style={{ border: '1px solid #000', padding: 10, background: '#fee2e2', fontWeight: 800 }}>รายการหัก</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['ภาษีเงินได้', form.incomeTax],
                    ['เงินประกันสังคม', form.socialSecurity],
                    ['กองทุนสำรองเลี้ยงชีพ', form.providentFund],
                    ['หักขาด/ลา/มาสาย', form.absentLateDeduction],
                    ['หักชุดฟอร์ม', form.uniformDeduction],
                    ['เบิกล่วงหน้า', form.advanceDeduction],
                    ['รวมรายการหัก', totalDeductions]
                  ].map(([label, value], index) => (
                    <tr key={label}>
                      <td style={{ border: '1px solid #000', padding: 10, fontWeight: label === 'รวมรายการหัก' ? 800 : 600 }}>{label}</td>
                      <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right', background: index === 6 ? '#fff1f2' : '#fff', fontWeight: label === 'รวมรายการหัก' ? 800 : 500 }}>
                        {formatMoney(Number(value))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontSize: 13 }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 800, width: '24%' }}>รวมเงินได้สุทธิ</td>
                  <td style={{ border: '1px solid #000', padding: 10, textAlign: 'right', fontWeight: 800, color: '#166534' }}>
                    {formatMoney(netIncome)} บาท
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 10, fontWeight: 800 }}>รวม ตัวอักษร</td>
                  <td style={{ border: '1px solid #000', padding: 10 }}>{numberToThaiText(netIncome)}</td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 12, fontWeight: 700, width: '25%' }}>จัดทำโดย</td>
                  <td style={{ border: '1px solid #000', padding: 12 }}>{form.preparedBy || '-'}</td>
                  <td style={{ border: '1px solid #000', padding: 12, fontWeight: 700, width: '30%' }}>กรรมการและผู้จัดการฝ่ายบริหาร</td>
                  <td style={{ border: '1px solid #000', padding: 12 }}>{form.approvedBy || '-'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: 12, fontWeight: 700 }}>วันที่</td>
                  <td style={{ border: '1px solid #000', padding: 12 }}>{form.documentDate || '-'}</td>
                  <td style={{ border: '1px solid #000', padding: 12 }}></td>
                  <td style={{ border: '1px solid #000', padding: 12 }}></td>
                </tr>
              </tbody>
            </table>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 26 }}>
              <button
                onClick={() => setShowResult(false)}
                style={{
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#64748b',
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ← {L('Back to Edit', 'กลับไปแก้ไข')}
              </button>
              <button
                onClick={handlePrint}
                style={{
                  padding: '12px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#2563eb',
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🖨️ {L('Print', 'พิมพ์')}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </AccWindow>
  )
}
