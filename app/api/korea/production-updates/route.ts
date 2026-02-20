import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET() {
  try {
    const rows = await query('SELECT * FROM kr_production_updates ORDER BY created_at DESC')
    return NextResponse.json(rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, orderNumber, productName, branch, branchCode, totalQuantity, completedQuantity, progressPercent, currentStage, assignedTeam, startDate, estimatedCompletion, lastUpdate, notes } = body
    await query(
      `INSERT INTO kr_production_updates (id,orderNumber,productName,branch,branchCode,totalQuantity,completedQuantity,progressPercent,currentStage,assignedTeam,startDate,estimatedCompletion,lastUpdate,notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, orderNumber, productName, branch ?? 'Korea', branchCode ?? 'KR', totalQuantity ?? 0, completedQuantity ?? 0, progressPercent ?? 0, currentStage ?? 'assembly', assignedTeam, startDate, estimatedCompletion, lastUpdate, notes ?? null]
    )
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, completedQuantity, progressPercent, currentStage, lastUpdate, notes } = body
    await query(
      `UPDATE kr_production_updates SET completedQuantity=?, progressPercent=?, currentStage=?, lastUpdate=?, notes=? WHERE id=?`,
      [completedQuantity, progressPercent, currentStage, lastUpdate, notes ?? null, id]
    )
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
