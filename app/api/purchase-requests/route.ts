import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('prID')
    const prNo = searchParams.get('prNo')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const baseSelect = `
      SELECT pr.*,
             (SELECT COUNT(*) FROM purchase_request_items WHERE prID = pr.prID) as item_count
      FROM purchase_requests pr
    `

    if (id) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE pr.prID = ?`, [id])
      if (rows && rows.length > 0) {
        const pr = rows[0]
        const [items]: any = await pool.query(
          `SELECT * FROM purchase_request_items WHERE prID = ? ORDER BY itemID`,
          [pr.prID]
        )
        pr.items = items || []
        return NextResponse.json({ success: true, purchaseRequest: pr, rows: [pr] })
      }
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    if (prNo) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE pr.prNo = ?`, [prNo])
      if (rows && rows.length > 0) {
        const pr = rows[0]
        const [items]: any = await pool.query(
          `SELECT * FROM purchase_request_items WHERE prID = ? ORDER BY itemID`,
          [pr.prID]
        )
        pr.items = items || []
        return NextResponse.json({ success: true, purchaseRequest: pr, rows: [pr] })
      }
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    let query = baseSelect + ` WHERE 1=1`
    const params: any[] = []

    if (status) {
      query += ` AND pr.status = ?`
      params.push(status)
    }

    query += ` ORDER BY pr.prID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)
    const [countResult]: any = await pool.query(`SELECT COUNT(*) as total FROM purchase_requests`)

    return NextResponse.json({ success: true, rows, total: countResult[0]?.total || 0, limit, offset })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prDate, department, requested_by, purpose, priority, required_date, total_amount, notes, items, created_by } = body

    const prNo = await generateDocumentNumber('PR', 'purchase_requests', 'prNo')
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [result]: any = await connection.query(
        `INSERT INTO purchase_requests (prNo, prDate, department, requested_by, purpose, priority, required_date, total_amount, notes, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [prNo, prDate, department, requested_by, purpose, priority || 'normal', required_date, total_amount || 0, notes, created_by]
      )

      const prID = result.insertId

      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          await connection.query(
            `INSERT INTO purchase_request_items (prID, product_code, description, quantity, unit, estimated_price, total_price, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [prID, item.product_code || '', item.description || '', item.quantity || 1, item.unit || 'pcs', item.estimated_price || 0, item.total_price || 0, item.notes || '']
          )
        }
      }

      await connection.commit()
      return NextResponse.json({ success: true, prID, prNo, message: 'Created successfully' })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error: any) {
    console.error('Create error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, prID, status, approved_by } = body
    const recordId = id || prID

    if (!recordId) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    }

    let updateQuery = 'UPDATE purchase_requests SET '
    const params: any[] = []

    if (status) {
      updateQuery += 'status = ?'
      params.push(status)
    }

    if (approved_by) {
      if (params.length > 0) updateQuery += ', '
      updateQuery += 'approved_by = ?, approved_at = NOW()'
      params.push(approved_by)
    }

    if (params.length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    updateQuery += ' WHERE prID = ?'
    params.push(recordId)

    const [result]: any = await pool.query(updateQuery, params)

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Updated successfully' })
  } catch (error: any) {
    console.error('Update error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('prID')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    }

    await pool.query('DELETE FROM purchase_requests WHERE prID = ?', [id])
    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
