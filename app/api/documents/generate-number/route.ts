import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

// API สำหรับสร้างเลขที่เอกสารทุกประเภท โดยเช็คจากฐานข้อมูลจริง
// รองรับ: PR, CN, EB, GR, PV, SI, SC, ST, SA, WT, PDO, FWL, IMP, EXP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Document type is required' },
        { status: 400 }
      )
    }

    // Mapping ระหว่าง type กับ prefix, table name, และ field name
    const documentTypes: Record<string, { prefix: string; table: string; field: string }> = {
      // Purchase & Procurement
      'pr': { prefix: 'PR', table: 'purchase_requests', field: 'prNo' },
      'si': { prefix: 'SI', table: 'supplier_invoices', field: 'siNo' },
      'gr': { prefix: 'GR', table: 'goods_receipts', field: 'grNo' },

      // Inventory & Warehouse
      'sc': { prefix: 'SC', table: 'stock_cards', field: 'scNo' },
      'st': { prefix: 'ST', table: 'stock_transfers', field: 'stNo' },
      'sa': { prefix: 'SA', table: 'stock_adjustments', field: 'saNo' },
      'imp': { prefix: 'IMP', table: 'imports', field: 'impNo' },
      'exp': { prefix: 'EXP', table: 'exports', field: 'expNo' },

      // Finance & Payments
      'pv': { prefix: 'PV', table: 'payment_vouchers', field: 'pvNo' },
      'cn': { prefix: 'CN', table: 'credit_notes', field: 'cnNo' },
      'eb': { prefix: 'EB', table: 'expense_bills', field: 'ebNo' },

      // Production
      'pdo': { prefix: 'PDO', table: 'production_orders', field: 'pdoNo' },

      // After Sales
      'wt': { prefix: 'WT', table: 'warranties', field: 'wtNo' },
      'fwl': { prefix: 'FWL', table: 'field_work_logs', field: 'fwlNo' }
    }

    const docType = documentTypes[type.toLowerCase()]

    if (!docType) {
      return NextResponse.json(
        { success: false, error: `Unknown document type: ${type}` },
        { status: 400 }
      )
    }

    // สร้างรูปแบบวันที่ YYYYMMDD
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const datePrefix = `${year}${month}${day}`

    // สร้าง pattern สำหรับค้นหา เช่น PR-20260324-%
    const searchPattern = `${docType.prefix}-${datePrefix}-%`

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // ตรวจสอบว่าตารางมีอยู่หรือไม่
      const [tableCheck]: any = await connection.query(
        `SELECT COUNT(*) as cnt FROM information_schema.tables
         WHERE table_schema = DATABASE() AND table_name = ?`,
        [docType.table]
      )

      if (tableCheck[0].cnt === 0) {
        throw new Error(`Table ${docType.table} does not exist`)
      }

      // ดึงเลขที่เอกสารล่าสุดของวันนี้
      const [rows]: any = await connection.query(
        `SELECT ${docType.field} as docNo
         FROM ${docType.table}
         WHERE ${docType.field} LIKE ?
         ORDER BY ${docType.field} DESC
         LIMIT 1`,
        [searchPattern]
      )

      let nextNumber = 1

      if (rows.length > 0 && rows[0].docNo) {
        // แยกเลขลำดับจากเลขที่เอกสาร เช่น PR-20260324-0005 -> 5
        const lastDocNo = rows[0].docNo
        const parts = lastDocNo.split('-')
        if (parts.length >= 3) {
          const lastSeq = parseInt(parts[parts.length - 1]) || 0
          nextNumber = lastSeq + 1
        }
      }

      // สร้างเลขที่เอกสารใหม่
      const sequenceStr = String(nextNumber).padStart(5, '0')
      let newDocNo: string

      if (docType.prefix === 'WT') {
        // Warranty: WT-TH-YYYYMMDD-#####
        newDocNo = `${docType.prefix}-TH-${datePrefix}-${sequenceStr}`
      } else {
        // เอกสารอื่นๆ: XX-YYYYMMDD-#####
        newDocNo = `${docType.prefix}-${datePrefix}-${sequenceStr}`
      }

      await connection.commit()

      return NextResponse.json({
        success: true,
        docNo: newDocNo,
        prefix: docType.prefix,
        type: type.toUpperCase(),
        sequence: nextNumber,
        lastDocNo: rows.length > 0 ? rows[0].docNo : null
      })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error: any) {
    console.error('Generate document number error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate document number'
      },
      { status: 500 }
    )
  }
}
