import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    const branch = searchParams.get('branch')

    if (id) {
      const rows = await query('SELECT * FROM kr_production_orders WHERE id = ?', [id])
      if (!rows[0]) return NextResponse.json(null)
      const items = await query('SELECT * FROM kr_production_order_items WHERE orderId = ?', [id])
      return NextResponse.json({ ...rows[0], items })
    }

    let sql = 'SELECT * FROM kr_production_orders WHERE 1=1'
    const params: any[] = []
    if (status) { sql += ' AND status = ?'; params.push(status) }
    if (branch) { sql += ' AND branch = ?'; params.push(branch) }
    sql += ' ORDER BY dueDate ASC'

    const rows = await query(sql, params)
    return NextResponse.json(rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, orderNumber, branch, branchCode, product, quantity, status, dueDate, priority, customerName, orderDate, productionNote, items } = body

    await query(
      `INSERT INTO kr_production_orders (id, orderNumber, branch, branchCode, product, quantity, status, dueDate, priority, customerName, orderDate, productionNote)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, orderNumber, branch, branchCode, product, quantity || 0, status || 'pending', dueDate || null, priority || 'medium', customerName, orderDate || null, productionNote || null]
    )

    if (items && Array.isArray(items)) {
      for (const item of items) {
        await query(
          'INSERT INTO kr_production_order_items (orderId, name, code, quantity, unit, description) VALUES (?, ?, ?, ?, ?, ?)',
          [id, item.name, item.code || null, item.quantity || 0, item.unit || 'pcs', item.description || null]
        )
      }
    }

    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status } = body
    await query('UPDATE kr_production_orders SET status = ? WHERE id = ?', [status, id])
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
