import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

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
          i.customer_address,
          i.customer_phone,
          i.customer_email,
          i.issueDate,
          i.dueDate,
          i.subtotal,
          i.taxRate,
          i.taxAmount,
          i.vat_amount,
          i.totalAmount,
          i.paymentStatus,
          i.notes,
          i.salesContractNumber,
          i.branch_code,
          i.pdo_number,
          i.pdo_branch,
          i.shipment_no,
          i.repdo_no,
          i.qaqc_no,
          i.supplier_name,
          i.supplier_phone,
          i.supplier_email,
          i.created_at,
          po.pdoNo AS linked_pdo_number,
          po.pdoDate AS linked_pdo_date,
          po.product_name AS linked_pdo_product,
          po.status AS linked_pdo_status
        FROM kr_hr_invoices i
        LEFT JOIN production_orders po ON i.pdo_number = po.pdoNo
      `

      const params: string[] = []
      const where: string[] = []

      if (status === 'unpaid') {
        where.push(`i.paymentStatus IN ('unpaid', 'partial', 'overdue')`)
      } else if (status !== 'all') {
        where.push(`i.paymentStatus = ?`)
        params.push(status)
      }

      // Filter by branch_code first, fallback to notes for legacy records
      if (branch) {
        const branchCodeMap: { [key: string]: string } = {
          thailand: 'TH', vietnam: 'VN', malaysia: 'MY', brunei: 'BN', korea: 'KR'
        }
        const branchCode = branchCodeMap[branch.toLowerCase()] || branch.slice(0, 2).toUpperCase()
        where.push(`(i.branch_code = ? OR (i.branch_code IS NULL AND i.notes LIKE ?))`)
        params.push(branchCode, `%Branch: ${branchCode}%`)
      }

      if (where.length > 0) {
        query += ` WHERE ${where.join(' AND ')}`
      }

      query += ` ORDER BY i.created_at DESC`

      const [rows]: any = await connection.query(query, params)

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
