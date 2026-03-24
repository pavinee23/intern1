import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id') || searchParams.get('orderID')
    const orderNo = searchParams.get('orderNo')
    const q = searchParams.get('q')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '200')

    if (id) {
      const [rows]: any = await pool.query(
        `SELECT * FROM sales_orders WHERE orderID = ?`, [id]
      )
      const order = rows?.[0] || null
      if (order) {
        const [items]: any = await pool.query(
          `SELECT * FROM sales_order_items WHERE orderID = ?`, [order.orderID]
        )
        order.items = items || []
      }
      return NextResponse.json({ success: true, order })
    }

    if (orderNo) {
      const [rows]: any = await pool.query(
        `SELECT * FROM sales_orders WHERE orderNo = ?`, [orderNo]
      )
      const order = rows?.[0] || null
      if (order) {
        const [items]: any = await pool.query(
          `SELECT * FROM sales_order_items WHERE orderID = ?`, [order.orderID]
        )
        order.items = items || []
      }
      return NextResponse.json({ success: true, order })
    }

    let where = ''
    const params: any[] = []
    if (q) {
      where += ' AND (so.orderNo LIKE ? OR so.customer_name LIKE ? OR so.customer_phone LIKE ?)'
      params.push(`%${q}%`, `%${q}%`, `%${q}%`)
    }
    if (status) {
      where += ' AND so.status = ?'
      params.push(status)
    }

    const [rows]: any = await pool.query(
      `SELECT so.* FROM sales_orders so
       WHERE 1=1${where}
       ORDER BY so.created_at DESC, so.orderID DESC
       LIMIT ?`,
      [...params, limit]
    )

    return NextResponse.json({ success: true, orders: rows || [] })
  } catch (err: any) {
    console.error('GET /api/sales-orders error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json()

    const [r]: any = await pool.query(
      `INSERT INTO sales_orders
        (orderNo, order_date, cusID, customer_name, customer_email, customer_phone,
         customer_address, delivery_date, subtotal, discount_percent, discount_amount,
         vat_percent, vat_amount, priceTotal, notes, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        b.orderNo || null,
        b.orderDate || new Date().toISOString().slice(0, 10),
        b.cusID || null,
        b.customerName || null,
        b.customerEmail || null,
        b.customerPhone || null,
        b.customerAddress || null,
        b.deliveryDate || null,
        b.subtotal || 0,
        b.discountPercent || 0,
        b.discountAmount || 0,
        b.vatPercent || 7,
        b.vatAmount || 0,
        b.priceTotal || 0,
        b.notes || null,
        b.status || 'pending'
      ]
    )

    const orderID = r.insertId

    if (Array.isArray(b.items) && b.items.length > 0) {
      for (const item of b.items) {
        await pool.query(
          `INSERT INTO sales_order_items
            (orderID, productID, sku, product_name, quantity, unit_price, total_price)
           VALUES (?,?,?,?,?,?,?)`,
          [
            orderID,
            item.product_id || null,
            item.sku || null,
            item.product_name || item.productName || '',
            item.quantity || 1,
            item.unit_price || item.unitPrice || 0,
            (item.quantity || 1) * (item.unit_price || item.unitPrice || 0)
          ]
        )
      }
    }

    return NextResponse.json({ success: true, orderID, orderNo: b.orderNo })
  } catch (err: any) {
    console.error('POST /api/sales-orders error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const b = await req.json()
    const id = b.id || b.orderID
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })

    const fields: string[] = []
    const params: any[] = []

    if (b.status !== undefined) { fields.push('status = ?'); params.push(b.status) }
    if (b.notes !== undefined) { fields.push('notes = ?'); params.push(b.notes) }
    if (b.delivery_date !== undefined) { fields.push('delivery_date = ?'); params.push(b.delivery_date) }

    if (fields.length === 0) return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 })

    params.push(id)
    await pool.query(`UPDATE sales_orders SET ${fields.join(', ')} WHERE orderID = ?`, params)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('PATCH /api/sales-orders error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id') || searchParams.get('orderID')
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })

    await pool.query('DELETE FROM sales_order_items WHERE orderID = ?', [id])
    await pool.query('DELETE FROM sales_orders WHERE orderID = ?', [id])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE /api/sales-orders error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
