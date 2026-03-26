import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import type { RowDataPacket } from 'mysql2/promise'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await pool.getConnection()

    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `
        SELECT
          i.id,
          i.invoiceNumber,
          i.customer,
          i.customer_address,
          i.issueDate,
          i.dueDate,
          i.subtotal,
          i.taxRate,
          i.taxAmount,
          i.totalAmount,
          i.paymentStatus,
          i.notes,
          i.salesContractNumber,
          i.pdo_number,
          i.pdo_branch,
          i.created_at,
          po.pdoNo AS linked_pdo_number,
          po.pdoDate AS linked_pdo_date,
          po.product_name AS linked_pdo_product,
          po.status AS linked_pdo_status
        FROM kr_hr_invoices i
        LEFT JOIN production_orders po ON i.pdo_number = po.pdoNo
        WHERE i.id = ?
        `,
        [params.id]
      )

      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Invoice not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        invoice: rows[0]
      })
    } finally {
      connection.release()
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
