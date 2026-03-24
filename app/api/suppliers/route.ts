import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const [rows]: any = await pool.query('SELECT * FROM suppliers WHERE supplier_id = ?', [id])
      return NextResponse.json({ success: true, supplier: rows?.[0] || null })
    }

    const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY supplier_id DESC')
    return NextResponse.json({ success: true, rows })
  } catch (error: any) {
    console.error('Suppliers API error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, company, tax_id, email, phone, address, product_type, notes, created_by } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Supplier name is required' }, { status: 400 })
    }

    const [result]: any = await pool.query(
      `INSERT INTO suppliers (name, company, tax_id, email, phone, address, product_type, notes, created_by, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [name, company || null, tax_id || null, email || null, phone || null, address || null, product_type || null, notes || null, created_by || null]
    )

    return NextResponse.json({ success: true, id: result.insertId })
  } catch (error: any) {
    console.error('Suppliers POST error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { supplier_id, name, company, tax_id, email, phone, address, product_type, notes, is_active } = body

    if (!supplier_id) {
      return NextResponse.json({ success: false, error: 'Supplier ID is required' }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ success: false, error: 'Supplier name is required' }, { status: 400 })
    }

    await pool.query(
      `UPDATE suppliers
       SET name = ?, company = ?, tax_id = ?, email = ?, phone = ?, address = ?, product_type = ?, notes = ?, is_active = ?
       WHERE supplier_id = ?`,
      [name, company || null, tax_id || null, email || null, phone || null, address || null, product_type || null, notes || null, is_active ?? 1, supplier_id]
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Suppliers PUT error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Supplier ID is required' }, { status: 400 })
    }

    await pool.query('DELETE FROM suppliers WHERE supplier_id = ?', [id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Suppliers DELETE error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
