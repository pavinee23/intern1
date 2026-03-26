import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import type { RowDataPacket } from 'mysql2/promise'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'unpaid'
    const branch = searchParams.get('branch')

    const connection = await pool.getConnection()

    try {
      let query = `
        SELECT
          i.id,
          i.invoiceNumber,
          i.customer,
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
      `

      const params: string[] = []
      let hasWhere = false

      if (status === 'unpaid') {
        query += ` WHERE i.paymentStatus IN ('unpaid', 'partial', 'overdue')`
        hasWhere = true
      } else if (status !== 'all') {
        query += ` WHERE i.paymentStatus = ?`
        params.push(status)
        hasWhere = true
      }

      // Filter by branch (customer name contains branch name)
      if (branch) {
        const branchMap: { [key: string]: string } = {
          'thailand': 'Thailand',
          'vietnam': 'Vietnam',
          'malaysia': 'Malaysia',
          'brunei': 'Brunei'
        }
        const customerPattern = branchMap[branch.toLowerCase()] || branch
        query += hasWhere ? ` AND` : ` WHERE`
        query += ` i.customer LIKE ?`
        params.push(`%${customerPattern}%`)
        hasWhere = true
      }

      query += ` ORDER BY i.created_at DESC`

      const [rows] = await connection.query<RowDataPacket[]>(query, params)

      return NextResponse.json({
        success: true,
        rows,
        count: rows.length
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
