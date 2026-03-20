import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')
    let sql = 'SELECT * FROM acc_products'
    const params: any[] = []
    if (q) { sql += ' WHERE name_th LIKE ? OR code LIKE ?'; const like = `%${q}%`; params.push(like, like) }
    sql += ' ORDER BY name_th'
    const [rows]: any = await pool.query(sql, params)
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()
    const [countRows]: any = await pool.query("SELECT COUNT(*) as cnt FROM acc_products")
    const code = b.code || `PRD-${String((countRows[0].cnt || 0) + 1).padStart(4, '0')}`
    const [r]: any = await pool.query(
      `INSERT INTO acc_products (code,name_th,name_en,unit,cost_price,sale_price,qty_onhand,reorder_level,category,is_active)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [code, b.name_th, b.name_en||null, b.unit||'-', b.cost_price||0, b.sale_price||0, b.qty_onhand||0, b.reorder_level||0, b.category||null, 1]
    )
    return NextResponse.json({ ok: true, id: r.insertId })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const b = await req.json()
    await pool.query(
      `UPDATE acc_products SET name_th=?,name_en=?,unit=?,cost_price=?,sale_price=?,reorder_level=?,category=?,is_active=? WHERE id=?`,
      [b.name_th, b.name_en||null, b.unit||'-', b.cost_price||0, b.sale_price||0, b.reorder_level||0, b.category||null, b.is_active??1, b.id]
    )
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    await pool.query('DELETE FROM acc_products WHERE id=?', [id])
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
