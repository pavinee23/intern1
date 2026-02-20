import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const branch = searchParams.get('branch')

    if (id) {
      const rows = await query('SELECT * FROM kr_pre_install_analysis WHERE id = ?', [id])
      const row = rows[0]
      if (!row) return NextResponse.json(null)
      return NextResponse.json({
        ...row,
        additionalEquipment: row.additionalEquipment ? (typeof row.additionalEquipment === 'string' ? JSON.parse(row.additionalEquipment) : row.additionalEquipment) : [],
        additionalTests: row.additionalTests ? (typeof row.additionalTests === 'string' ? JSON.parse(row.additionalTests) : row.additionalTests) : {}
      })
    }

    let sql = 'SELECT * FROM kr_pre_install_analysis WHERE 1=1'
    const params: any[] = []
    if (branch) { sql += ' AND branch = ?'; params.push(branch) }
    sql += ' ORDER BY datetime DESC LIMIT 200'

    const rows = await query(sql, params)
    return NextResponse.json(rows.map((r: any) => ({
      ...r,
      additionalEquipment: r.additionalEquipment ? (typeof r.additionalEquipment === 'string' ? JSON.parse(r.additionalEquipment) : r.additionalEquipment) : [],
      additionalTests: r.additionalTests ? (typeof r.additionalTests === 'string' ? JSON.parse(r.additionalTests) : r.additionalTests) : {}
    })))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, branch, location, equipment, datetime, technician, voltage, frequency, powerFactor, thd, current, balance, result, recommendation, notes, riskAssessment, estimatedCost, additionalEquipment, additionalTests, scheduledFollowUp } = body
    await query(
      `INSERT INTO kr_pre_install_analysis (id, branch, location, equipment, datetime, technician, voltage, frequency, powerFactor, thd, current_L1, current_L2, current_L3, current_N, balance, result, recommendation, notes, riskAssessment, estimatedCost, additionalEquipment, additionalTests, scheduledFollowUp_date, scheduledFollowUp_technician, scheduledFollowUp_priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, branch, location, equipment, datetime, technician, voltage || null, frequency || null, powerFactor || null, thd || null, current?.L1 || null, current?.L2 || null, current?.L3 || null, current?.N || null, balance || null, result || null, recommendation || null, notes || null, riskAssessment || null, estimatedCost || null, JSON.stringify(additionalEquipment || []), JSON.stringify(additionalTests || {}), scheduledFollowUp?.date || null, scheduledFollowUp?.technician || null, scheduledFollowUp?.priority || null]
    )
    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, branch, location, equipment, datetime, technician, voltage, frequency, powerFactor, thd, current, balance, result, recommendation, notes, riskAssessment, estimatedCost, additionalEquipment, additionalTests, scheduledFollowUp } = body
    await query(
      `UPDATE kr_pre_install_analysis SET branch=?, location=?, equipment=?, datetime=?, technician=?, voltage=?, frequency=?, powerFactor=?, thd=?, current_L1=?, current_L2=?, current_L3=?, current_N=?, balance=?, result=?, recommendation=?, notes=?, riskAssessment=?, estimatedCost=?, additionalEquipment=?, additionalTests=?, scheduledFollowUp_date=?, scheduledFollowUp_technician=?, scheduledFollowUp_priority=? WHERE id=?`,
      [branch, location, equipment, datetime, technician, voltage || null, frequency || null, powerFactor || null, thd || null, current?.L1 || null, current?.L2 || null, current?.L3 || null, current?.N || null, balance || null, result || null, recommendation || null, notes || null, riskAssessment || null, estimatedCost || null, JSON.stringify(additionalEquipment || []), JSON.stringify(additionalTests || {}), scheduledFollowUp?.date || null, scheduledFollowUp?.technician || null, scheduledFollowUp?.priority || null, id]
    )
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await query('DELETE FROM kr_pre_install_analysis WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
