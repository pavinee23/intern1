import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      invNo,
      invDate,
      customer_name,
      customer_phone,
      customer_address,
      subtotal,
      vat,
      vat_amount,
      total_amount,
      items,
      branch_code,
      delivery_reference
    } = body

    // Validate required fields
    if (!invNo || !customer_name) {
      return NextResponse.json(
        { success: false, error: 'Invoice number and customer name are required' },
        { status: 400 }
      )
    }

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Insert invoice
      const [result]: any = await connection.query(
        `INSERT INTO invoices
        (invNo, branch_code, invDate, customer_name, subtotal, discount, vat, total_amount, notes, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, NOW())`,
        [
          invNo,
          branch_code || null,
          invDate || new Date().toISOString().split('T')[0],
          customer_name,
          subtotal || 0,
          vat || 0,
          total_amount || 0,
          `${delivery_reference ? `Ref: ${delivery_reference}` : ''}${customer_phone ? ` | Phone: ${customer_phone}` : ''}${customer_address ? ` | Address: ${customer_address}` : ''}`.trim(),
          `${branch_code || 'Branch'} System`
        ]
      )

      const invoiceId = result.insertId

      // Insert items
      if (Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await connection.query(
            `INSERT INTO invoice_items
            (invID, item_desc, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?)`,
            [
              invoiceId,
              item.desc || '',
              item.qty || 0,
              item.price || 0,
              item.total || 0
            ]
          )
        }
      }

      await connection.commit()

      return NextResponse.json({
        success: true,
        invoiceId,
        invoiceNumber: invNo,
        message: 'Invoice created successfully'
      })

    } catch (error: any) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error creating branch invoice:', message)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
