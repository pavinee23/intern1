"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../components/AdminLayout'
import styles from '../../../admin-theme.module.css'

type MaterialType = {
  material_code: string
  material_name: string
  quantity_required: number
  unit: string
}

type StepType = {
  step_number: number
  step_name: string
  description: string
  duration_minutes: number
  assigned_to: string
}

export default function CreateProductionOrderPage() {
  const router = useRouter()

  const [pdoNo, setPdoNo] = useState('')
  const [pdoDate, setPdoDate] = useState(() => new Date().toISOString().split('T')[0])
  const [productCode, setProductCode] = useState('')
  const [productName, setProductName] = useState('')
  const [quantityOrdered, setQuantityOrdered] = useState(1)
  const [unit, setUnit] = useState('pcs')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('normal')
  const [productionLine, setProductionLine] = useState('')
  const [shift, setShift] = useState('morning')
  const [supervisor, setSupervisor] = useState('')
  const [notes, setNotes] = useState('')

  const [materials, setMaterials] = useState<MaterialType[]>([{
    material_code: '',
    material_name: '',
    quantity_required: 0,
    unit: 'pcs'
  }])

  const [steps, setSteps] = useState<StepType[]>([{
    step_number: 1,
    step_name: '',
    description: '',
    duration_minutes: 0,
    assigned_to: ''
  }])

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

  // Renumber steps when they change
  useEffect(() => {
    const renumbered = steps.map((step, idx) => ({ ...step, step_number: idx + 1 }))
    if (JSON.stringify(renumbered) !== JSON.stringify(steps)) {
      setSteps(renumbered)
    }
  }, [steps.length])

  // Materials management
  function addMaterial() {
    setMaterials([...materials, {
      material_code: '',
      material_name: '',
      quantity_required: 0,
      unit: 'pcs'
    }])
  }

  function updateMaterial(i: number, key: keyof MaterialType, value: any) {
    const copy = [...materials]
    if (key === 'material_code' || key === 'material_name' || key === 'unit') {
      copy[i][key] = value
    } else {
      copy[i][key] = Number(value)
    }
    setMaterials(copy)
  }

  function removeMaterial(i: number) {
    if (materials.length === 1) return
    setMaterials(materials.filter((_, idx) => idx !== i))
  }

  // Steps management
  function addStep() {
    setSteps([...steps, {
      step_number: steps.length + 1,
      step_name: '',
      description: '',
      duration_minutes: 0,
      assigned_to: ''
    }])
  }

  function updateStep(i: number, key: keyof StepType, value: any) {
    const copy = [...steps]
    if (key === 'step_number' || key === 'duration_minutes') {
      copy[i][key] = Number(value)
    } else {
      copy[i][key] = value
    }
    setSteps(copy)
  }

  function removeStep(i: number) {
    if (steps.length === 1) return
    const filtered = steps.filter((_, idx) => idx !== i)
    // Renumber after removal
    const renumbered = filtered.map((step, idx) => ({ ...step, step_number: idx + 1 }))
    setSteps(renumbered)
  }

  function moveStepUp(i: number) {
    if (i === 0) return
    const copy = [...steps]
    ;[copy[i - 1], copy[i]] = [copy[i], copy[i - 1]]
    const renumbered = copy.map((step, idx) => ({ ...step, step_number: idx + 1 }))
    setSteps(renumbered)
  }

  function moveStepDown(i: number) {
    if (i === steps.length - 1) return
    const copy = [...steps]
    ;[copy[i], copy[i + 1]] = [copy[i + 1], copy[i]]
    const renumbered = copy.map((step, idx) => ({ ...step, step_number: idx + 1 }))
    setSteps(renumbered)
  }

  function validate() {
    const errs: string[] = []

    if (!productName) errs.push(L('Product name is required', 'กรุณาระบุชื่อสินค้า'))
    if (quantityOrdered <= 0) errs.push(L('Quantity ordered must be > 0', 'จำนวนสั่งผลิตต้อง > 0'))
    if (!startDate) errs.push(L('Start date is required', 'กรุณาระบุวันเริ่มต้น'))
    if (!dueDate) errs.push(L('Due date is required', 'กรุณาระบุวันครบกำหนด'))
    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
      errs.push(L('Due date must be >= start date', 'วันครบกำหนดต้อง >= วันเริ่มต้น'))
    }
    if (!productionLine) errs.push(L('Production line is required', 'กรุณาระบุสายการผลิต'))
    if (!supervisor) errs.push(L('Supervisor is required', 'กรุณาระบุหัวหน้างาน'))

    if (materials.length === 0) errs.push(L('At least 1 material required', 'ต้องมีอย่างน้อย 1 วัตถุดิบ'))
    materials.forEach((mat, idx) => {
      if (!mat.material_name) errs.push(L(`Material ${idx + 1} needs name`, `วัตถุดิบที่ ${idx + 1} ต้องมีชื่อ`))
      if (mat.quantity_required <= 0) errs.push(L(`Material ${idx + 1} quantity must be > 0`, `วัตถุดิบที่ ${idx + 1} จำนวนต้อง > 0`))
    })

    if (steps.length === 0) errs.push(L('At least 1 step required', 'ต้องมีอย่างน้อย 1 ขั้นตอน'))
    steps.forEach((step, idx) => {
      if (!step.step_name) errs.push(L(`Step ${idx + 1} needs name`, `ขั้นตอนที่ ${idx + 1} ต้องมีชื่อ`))
      if (step.duration_minutes <= 0) errs.push(L(`Step ${idx + 1} duration must be > 0`, `ขั้นตอนที่ ${idx + 1} ระยะเวลาต้อง > 0`))
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
        pdoDate,
        product_code: productCode,
        product_name: productName,
        quantity_ordered: quantityOrdered,
        unit,
        start_date: startDate,
        due_date: dueDate,
        priority,
        production_line: productionLine,
        shift,
        supervisor,
        materials: materials.map(mat => ({
          material_code: mat.material_code,
          material_name: mat.material_name,
          quantity_required: mat.quantity_required,
          unit: mat.unit
        })),
        steps: steps.map(step => ({
          step_number: step.step_number,
          step_name: step.step_name,
          description: step.description,
          duration_minutes: step.duration_minutes,
          assigned_to: step.assigned_to
        })),
        notes,
        created_by
      }

      const res = await fetch('/api/production-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const j = await res.json()

      if (res.ok && j.success) {
        setMessageBar({ type: 'success', text: L('Production order created successfully', 'สร้างใบสั่งผลิตสำเร็จ') })
        setTimeout(() => router.push('/Thailand/Admin-Login/documents/production-orders'), 900)
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
    <AdminLayout title="Create Production Order" titleTh="สร้างใบสั่งผลิต">
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
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            {L('Create Production Order', 'สร้างใบสั่งผลิต')}
          </h2>
        </div>

        <div className={styles.cardBody}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('PDO No.', 'เลขที่ PDO')}</label>
                <input type="text" value={pdoNo || L('Auto-generated', 'สร้างอัตโนมัติ')} disabled className={styles.formInput} style={{ background: '#f5f5f5' }} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Date', 'วันที่')}</label>
                <input type="date" value={pdoDate} readOnly className={styles.formInput} style={{ background: '#f5f5f5' }} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Product Code', 'รหัสสินค้า')}</label>
                <input type="text" value={productCode} onChange={e => setProductCode(e.target.value)} className={styles.formInput} placeholder={L('Product code', 'รหัสสินค้า')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Product Name', 'ชื่อสินค้า')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className={styles.formInput} placeholder={L('Product to produce', 'สินค้าที่จะผลิต')} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Quantity Ordered', 'จำนวนสั่งผลิต')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="number" value={quantityOrdered} onChange={e => setQuantityOrdered(Number(e.target.value))} className={styles.formInput} min="0.01" step="0.01" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Unit', 'หน่วย')}</label>
                <input type="text" value={unit} onChange={e => setUnit(e.target.value)} className={styles.formInput} />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Start Date', 'วันเริ่มต้น')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Due Date', 'วันครบกำหนด')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Priority', 'ความสำคัญ')}</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className={styles.formInput}>
                  <option value="low">{L('Low', 'ต่ำ')}</option>
                  <option value="normal">{L('Normal', 'ปกติ')}</option>
                  <option value="high">{L('High', 'สูง')}</option>
                  <option value="urgent">{L('Urgent', 'ด่วน')}</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Production Line', 'สายการผลิต')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={productionLine} onChange={e => setProductionLine(e.target.value)} className={styles.formInput} placeholder={L('Production line name', 'ชื่อสายการผลิต')} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Shift', 'กะ')}</label>
                <select value={shift} onChange={e => setShift(e.target.value)} className={styles.formInput}>
                  <option value="morning">{L('Morning', 'เช้า')}</option>
                  <option value="afternoon">{L('Afternoon', 'บ่าย')}</option>
                  <option value="night">{L('Night', 'ดึก')}</option>
                  <option value="all_day">{L('All Day', 'ทั้งวัน')}</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{L('Supervisor', 'หัวหน้างาน')} <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" value={supervisor} onChange={e => setSupervisor(e.target.value)} className={styles.formInput} placeholder={L('Supervisor name', 'ชื่อหัวหน้างาน')} />
              </div>
            </div>

            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600 }}>{L('Materials Required', 'วัตถุดิบที่ต้องใช้')}</h3>

            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '20%' }}>{L('Material Code', 'รหัสวัตถุดิบ')}</th>
                    <th style={{ width: '35%' }}>{L('Material Name', 'ชื่อวัตถุดิบ')}</th>
                    <th style={{ width: '20%' }}>{L('Quantity', 'จำนวน')}</th>
                    <th style={{ width: '20%' }}>{L('Unit', 'หน่วย')}</th>
                    <th style={{ width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((mat, i) => (
                    <tr key={i}>
                      <td><input type="text" value={mat.material_code} onChange={e => updateMaterial(i, 'material_code', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="text" value={mat.material_name} onChange={e => updateMaterial(i, 'material_name', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="number" value={mat.quantity_required} onChange={e => updateMaterial(i, 'quantity_required', e.target.value)} className={styles.formInput} min="0.01" step="0.01" style={{ width: '100%' }} /></td>
                      <td><input type="text" value={mat.unit} onChange={e => updateMaterial(i, 'unit', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td style={{ textAlign: 'center' }}>
                        <button type="button" onClick={() => removeMaterial(i)} disabled={materials.length === 1} className={styles.btnDanger} style={{ padding: '6px 12px', fontSize: '14px' }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" onClick={addMaterial} className={styles.btnSecondary} style={{ marginTop: 10 }}>+ {L('Add Material', 'เพิ่มวัตถุดิบ')}</button>

            <h3 style={{ marginTop: 30, marginBottom: 15, fontSize: 16, fontWeight: 600 }}>{L('Production Steps', 'ขั้นตอนการผลิต')}</h3>

            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: '8%' }}>{L('#', '#')}</th>
                    <th style={{ width: '22%' }}>{L('Step Name', 'ชื่อขั้นตอน')}</th>
                    <th style={{ width: '25%' }}>{L('Description', 'คำอธิบาย')}</th>
                    <th style={{ width: '12%' }}>{L('Duration (min)', 'ระยะเวลา (นาที)')}</th>
                    <th style={{ width: '20%' }}>{L('Assigned To', 'ผู้รับผิดชอบ')}</th>
                    <th style={{ width: '13%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((step, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{step.step_number}</td>
                      <td><input type="text" value={step.step_name} onChange={e => updateStep(i, 'step_name', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="text" value={step.description} onChange={e => updateStep(i, 'description', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td><input type="number" value={step.duration_minutes} onChange={e => updateStep(i, 'duration_minutes', e.target.value)} className={styles.formInput} min="1" style={{ width: '100%' }} /></td>
                      <td><input type="text" value={step.assigned_to} onChange={e => updateStep(i, 'assigned_to', e.target.value)} className={styles.formInput} style={{ width: '100%' }} /></td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button type="button" onClick={() => moveStepUp(i)} disabled={i === 0} className={styles.btnSecondary} style={{ padding: '4px 8px', fontSize: '12px' }}>↑</button>
                          <button type="button" onClick={() => moveStepDown(i)} disabled={i === steps.length - 1} className={styles.btnSecondary} style={{ padding: '4px 8px', fontSize: '12px' }}>↓</button>
                          <button type="button" onClick={() => removeStep(i)} disabled={steps.length === 1} className={styles.btnDanger} style={{ padding: '4px 8px', fontSize: '12px' }}>×</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" onClick={addStep} className={styles.btnSecondary} style={{ marginTop: 10 }}>+ {L('Add Step', 'เพิ่มขั้นตอน')}</button>

            <div className={styles.formGroup} style={{ marginTop: 20 }}>
              <label className={styles.formLabel}>{L('Notes', 'หมายเหตุ')}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className={styles.formInput} rows={2} placeholder={L('Additional notes...', 'หมายเหตุเพิ่มเติม...')} />
            </div>

            {errors.length > 0 && (
              <div style={{ padding: '12px 16px', marginBottom: '16px', borderRadius: 8, background: '#fee2e2', border: '1px solid #fca5a5', color: '#7f1d1d' }}>
                {errors.map((err, idx) => (<div key={idx}>• {err}</div>)))}
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
