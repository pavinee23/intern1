import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('poID')
    const poNo = searchParams.get('poNo')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const baseSelect = `SELECT * FROM production_orders`

    if (id) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE poID = ?`, [id])
      if (rows && rows.length > 0) {
        const po = rows[0]

        // Get materials
        const [materials]: any = await pool.query(
          `SELECT * FROM production_order_materials WHERE poID = ?`, [po.poID]
        )

        // Get steps
        const [steps]: any = await pool.query(
          `SELECT * FROM production_order_steps WHERE poID = ? ORDER BY step_number`, [po.poID]
        )

        po.materials = materials || []
        po.steps = steps || []

        return NextResponse.json({ success: true, productionOrder: po, rows: [po] })
      }
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    if (poNo) {
      const [rows]: any = await pool.query(baseSelect + ` WHERE poNo = ?`, [poNo])
      if (rows && rows.length > 0) {
        const po = rows[0]
        const [materials]: any = await pool.query(
          `SELECT * FROM production_order_materials WHERE poID = ?`, [po.poID]
        )
        const [steps]: any = await pool.query(
          `SELECT * FROM production_order_steps WHERE poID = ? ORDER BY step_number`, [po.poID]
        )
        po.materials = materials || []
        po.steps = steps || []
        return NextResponse.json({ success: true, productionOrder: po, rows: [po] })
      }
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    let query = baseSelect + ` WHERE 1=1`
    const params: any[] = []

    if (status) {
      query += ` AND status = ?`
      params.push(status)
    }

    query += ` ORDER BY poID DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)
    const [countResult]: any = await pool.query(`SELECT COUNT(*) as total FROM production_orders`)

    return NextResponse.json({ success: true, rows, total: countResult[0]?.total || 0 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      poDate, product_id, product_code, product_name, quantity_ordered, unit,
      start_date, due_date, priority, production_line, shift, supervisor,
      notes, materials, steps, created_by
    } = body

    const poNo = await generateDocumentNumber('PDO', 'production_orders', 'poNo')
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      const [result]: any = await connection.query(
        `INSERT INTO production_orders
        (poNo, poDate, product_id, product_code, product_name, quantity_ordered, unit, start_date, due_date, priority, production_line, shift, supervisor, notes, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [poNo, poDate, product_id, product_code, product_name, quantity_ordered || 0, unit || 'pcs', start_date, due_date, priority || 'normal', production_line, shift, supervisor, notes, created_by]
      )

      const poID = result.insertId

      // Insert materials
      if (materials && Array.isArray(materials) && materials.length > 0) {
        for (const material of materials) {
          await connection.query(
            `INSERT INTO production_order_materials
            (poID, material_id, material_code, material_name, quantity_required, unit)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [poID, material.material_id, material.material_code, material.material_name, material.quantity_required || 0, material.unit || 'pcs']
          )
        }
      }

      // Insert steps
      if (steps && Array.isArray(steps) && steps.length > 0) {
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i]
          await connection.query(
            `INSERT INTO production_order_steps
            (poID, step_number, step_name, description, duration_minutes, assigned_to)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [poID, i + 1, step.step_name, step.description, step.duration_minutes || 0, step.assigned_to]
          )
        }
      }

      await connection.commit()
      return NextResponse.json({ success: true, poID, poNo })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, poID, status, quantity_produced, quality_check_status, defect_quantity, actual_start_date, actual_end_date } = body
    const recordId = id || poID

    if (!recordId) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    let updates = []
    let params = []

    if (status) { updates.push('status = ?'); params.push(status) }
    if (quantity_produced !== undefined) { updates.push('quantity_produced = ?'); params.push(quantity_produced) }
    if (quality_check_status) { updates.push('quality_check_status = ?'); params.push(quality_check_status) }
    if (defect_quantity !== undefined) { updates.push('defect_quantity = ?'); params.push(defect_quantity) }
    if (actual_start_date) { updates.push('actual_start_date = ?'); params.push(actual_start_date) }
    if (actual_end_date) { updates.push('actual_end_date = ?'); params.push(actual_end_date) }

    if (updates.length === 0) return NextResponse.json({ success: false, error: 'No updates' }, { status: 400 })

    const query = `UPDATE production_orders SET ${updates.join(', ')} WHERE poID = ?`
    params.push(recordId)

    await pool.query(query, params)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('poID')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    await pool.query('DELETE FROM production_orders WHERE poID = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
