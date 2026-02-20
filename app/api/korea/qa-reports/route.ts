import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (id) {
      const rows = await query('SELECT * FROM kr_qa_reports WHERE id = ?', [id])
      const row = rows[0]
      if (!row) return NextResponse.json(null)
      return NextResponse.json({
        ...row,
        serialNumbers: row.serialNumbers ? JSON.parse(row.serialNumbers) : [],
        inspections: row.inspections ? JSON.parse(row.inspections) : []
      })
    }
    const rows = await query('SELECT * FROM kr_qa_reports ORDER BY date DESC LIMIT 200')
    return NextResponse.json(rows.map((r: any) => ({
      ...r,
      serialNumbers: r.serialNumbers ? (typeof r.serialNumbers === 'string' ? JSON.parse(r.serialNumbers) : r.serialNumbers) : [],
      inspections: r.inspections ? (typeof r.inspections === 'string' ? JSON.parse(r.inspections) : r.inspections) : []
    })))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, date, station, inspector, status, notes, billId, product, qty, orderNumber, productionNumber, serialNumbers, inspections } = body
    const reportId = id || `QA-${Date.now()}`
    await query(
      `INSERT INTO kr_qa_reports (id, date, station, inspector, status, notes, billId, product, qty, orderNumber, productionNumber, serialNumbers, inspections)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [reportId, date || new Date().toISOString().split('T')[0], station, inspector, status || 'pending', notes || null, billId || null, product || null, qty || 0, orderNumber || null, productionNumber || null, JSON.stringify(serialNumbers || []), JSON.stringify(inspections || [])]
    )
    return NextResponse.json({ success: true, id: reportId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    if (updates.serialNumbers !== undefined) updates.serialNumbers = JSON.stringify(updates.serialNumbers)
    if (updates.inspections !== undefined) updates.inspections = JSON.stringify(updates.inspections)
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ')
    const values = [...Object.values(updates), id]
    await query(`UPDATE kr_qa_reports SET ${fields} WHERE id = ?`, values)
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
    await query('DELETE FROM kr_qa_reports WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
