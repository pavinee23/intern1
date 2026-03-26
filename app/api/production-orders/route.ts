import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { generateDocumentNumber } from '@/lib/document-number'
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'

type DbExecutor = Pick<PoolConnection, 'query'>

type ColumnRow = RowDataPacket & {
  Field: string
}

type ProductionOrderSchema = {
  productionColumns: Set<string>
  materialColumns: Set<string>
  stepColumns: Set<string>
  pkCol: string
  noCol: string
  dateCol: string
  materialFkCol: string
  stepFkCol: string
}

async function getTableColumns(executor: DbExecutor, tableName: string): Promise<Set<string>> {
  const [rows] = await executor.query(`SHOW COLUMNS FROM \`${tableName}\``)
  return new Set((rows as ColumnRow[]).map((row) => row.Field))
}

async function getProductionOrderSchema(executor: DbExecutor): Promise<ProductionOrderSchema> {
  const productionColumns = await getTableColumns(executor, 'production_orders')
  const materialColumns = await getTableColumns(executor, 'production_order_materials')
  const stepColumns = await getTableColumns(executor, 'production_order_steps')

  return {
    productionColumns,
    materialColumns,
    stepColumns,
    pkCol: productionColumns.has('pdoID') ? 'pdoID' : productionColumns.has('poID') ? 'poID' : 'id',
    noCol: productionColumns.has('pdoNo') ? 'pdoNo' : 'poNo',
    dateCol: productionColumns.has('pdoDate') ? 'pdoDate' : 'poDate',
    materialFkCol: materialColumns.has('pdoID') ? 'pdoID' : materialColumns.has('poID') ? 'poID' : 'production_order_id',
    stepFkCol: stepColumns.has('pdoID') ? 'pdoID' : stepColumns.has('poID') ? 'poID' : 'production_order_id',
  }
}

function addCompatAliases(row: Record<string, unknown>, schema: ProductionOrderSchema) {
  if (!('pdoID' in row)) row.pdoID = row[schema.pkCol]
  if (!('id' in row)) row.id = row[schema.pkCol]
  if (!('pdoNo' in row)) row.pdoNo = row[schema.noCol]
  if (!('pdoDate' in row)) row.pdoDate = row[schema.dateCol]
  return row
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const pdoNo = searchParams.get('pdoNo')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const connection = await pool.getConnection()

    try {
      const schema = await getProductionOrderSchema(connection)
      const baseSelect = `SELECT * FROM production_orders`

      if (id) {
        const [rows] = await connection.query(`${baseSelect} WHERE ${schema.pkCol} = ?`, [id])
        const rowList = rows as RowDataPacket[]
        if (rowList.length > 0) {
          const po = addCompatAliases({ ...rowList[0] }, schema)
          const recordId = po[schema.pkCol]

          const [materials] = await connection.query(
            `SELECT * FROM production_order_materials WHERE ${schema.materialFkCol} = ?`, [recordId]
          )
          const [steps] = await connection.query(
            `SELECT * FROM production_order_steps WHERE ${schema.stepFkCol} = ? ORDER BY step_number`, [recordId]
          )

          po.materials = materials || []
          po.steps = steps || []

          return NextResponse.json({ success: true, productionOrder: po, rows: [po] })
        }
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
      }

      if (pdoNo) {
        const [rows] = await connection.query(`${baseSelect} WHERE ${schema.noCol} = ?`, [pdoNo])
        const rowList = rows as RowDataPacket[]
        if (rowList.length > 0) {
          const po = addCompatAliases({ ...rowList[0] }, schema)
          const recordId = po[schema.pkCol]
          const [materials] = await connection.query(
            `SELECT * FROM production_order_materials WHERE ${schema.materialFkCol} = ?`, [recordId]
          )
          const [steps] = await connection.query(
            `SELECT * FROM production_order_steps WHERE ${schema.stepFkCol} = ? ORDER BY step_number`, [recordId]
          )
          po.materials = materials || []
          po.steps = steps || []
          return NextResponse.json({ success: true, productionOrder: po, rows: [po] })
        }
        return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
      }

      let querySql = baseSelect + ` WHERE 1=1`
      const params: unknown[] = []

      if (status) {
        querySql += ` AND status = ?`
        params.push(status)
      }

      querySql += ` ORDER BY ${schema.pkCol} DESC LIMIT ? OFFSET ?`
      params.push(limit, offset)

      const [rows] = await connection.query(querySql, params)
      const [countResult] = await connection.query(`SELECT COUNT(*) as total FROM production_orders`)
      const normalizedRows = (rows as RowDataPacket[]).map((row) => addCompatAliases({ ...row }, schema))
      const countRows = countResult as Array<{ total?: number }>

      return NextResponse.json({ success: true, rows: normalizedRows, total: countRows[0]?.total || 0 })
    } finally {
      connection.release()
    }
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      pdoNo: incomingPdoNo,
      pdoDate, product_id, product_code, product_name, quantity_ordered, unit,
      start_date, due_date, priority, production_line, shift, supervisor,
      notes, materials, steps, created_by, sales_orderID
    } = body

    const connection = await pool.getConnection()

    try {
      const schema = await getProductionOrderSchema(connection)
      const pdoNo = incomingPdoNo || await generateDocumentNumber('PDO', 'production_orders', schema.noCol)

      await connection.beginTransaction()

      const insertColumns: string[] = []
      const insertValues: unknown[] = []
      const addInsertValue = (column: string, value: unknown) => {
        if (!schema.productionColumns.has(column)) return
        insertColumns.push(column)
        insertValues.push(value)
      }

      addInsertValue(schema.noCol, pdoNo)
      addInsertValue(schema.dateCol, pdoDate)
      addInsertValue('sales_orderID', sales_orderID || null)
      addInsertValue('product_id', product_id)
      addInsertValue('product_code', product_code)
      addInsertValue('product_name', product_name)
      addInsertValue('quantity_ordered', quantity_ordered || 0)
      addInsertValue('unit', unit || 'pcs')
      addInsertValue('start_date', start_date)
      addInsertValue('due_date', due_date)
      addInsertValue('priority', priority || 'normal')
      addInsertValue('production_line', production_line)
      addInsertValue('shift', shift)
      addInsertValue('supervisor', supervisor)
      addInsertValue('notes', notes)
      addInsertValue('created_by', created_by)
      addInsertValue('status', 'pending')

      const placeholders = insertColumns.map(() => '?').join(', ')
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO production_orders (${insertColumns.join(', ')}) VALUES (${placeholders})`,
        insertValues
      )

      const pdoID = result.insertId

      // Insert materials
      if (materials && Array.isArray(materials) && materials.length > 0) {
        for (const material of materials) {
          const materialColumns: string[] = []
          const materialValues: unknown[] = []
          const addMaterialValue = (column: string, value: unknown) => {
            if (!schema.materialColumns.has(column)) return
            materialColumns.push(column)
            materialValues.push(value)
          }

          addMaterialValue(schema.materialFkCol, pdoID)
          addMaterialValue('material_id', material.material_id)
          addMaterialValue('material_code', material.material_code)
          addMaterialValue('material_name', material.material_name)
          addMaterialValue('quantity_required', material.quantity_required || 0)
          addMaterialValue('unit', material.unit || 'pcs')

          await connection.query(
            `INSERT INTO production_order_materials (${materialColumns.join(', ')})
             VALUES (${materialColumns.map(() => '?').join(', ')})`,
            materialValues
          )
        }
      }

      // Insert steps
      if (steps && Array.isArray(steps) && steps.length > 0) {
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i]
          const stepColumns: string[] = []
          const stepValues: unknown[] = []
          const addStepValue = (column: string, value: unknown) => {
            if (!schema.stepColumns.has(column)) return
            stepColumns.push(column)
            stepValues.push(value)
          }

          addStepValue(schema.stepFkCol, pdoID)
          addStepValue('step_number', i + 1)
          addStepValue('step_name', step.step_name)
          addStepValue('description', step.description)
          addStepValue('duration_minutes', step.duration_minutes || 0)
          addStepValue('assigned_to', step.assigned_to)

          await connection.query(
            `INSERT INTO production_order_steps (${stepColumns.join(', ')})
             VALUES (${stepColumns.map(() => '?').join(', ')})`,
            stepValues
          )
        }
      }

      await connection.commit()
      return NextResponse.json({ success: true, pdoID, pdoNo })
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { pdoID, status, quantity_produced, quality_check_status, defect_quantity, actual_start_date, actual_end_date } = body
    const recordId = pdoID

    if (!recordId) return NextResponse.json({ success: false, error: 'pdoID required' }, { status: 400 })

    const connection = await pool.getConnection()

    try {
      const schema = await getProductionOrderSchema(connection)
      const updates: string[] = []
      const params: unknown[] = []

      if (status && schema.productionColumns.has('status')) { updates.push('status = ?'); params.push(status) }
      if (quantity_produced !== undefined && schema.productionColumns.has('quantity_produced')) { updates.push('quantity_produced = ?'); params.push(quantity_produced) }
      if (quality_check_status && schema.productionColumns.has('quality_check_status')) { updates.push('quality_check_status = ?'); params.push(quality_check_status) }
      if (defect_quantity !== undefined && schema.productionColumns.has('defect_quantity')) { updates.push('defect_quantity = ?'); params.push(defect_quantity) }
      if (actual_start_date && schema.productionColumns.has('actual_start_date')) { updates.push('actual_start_date = ?'); params.push(actual_start_date) }
      if (actual_end_date && schema.productionColumns.has('actual_end_date')) { updates.push('actual_end_date = ?'); params.push(actual_end_date) }

      if (updates.length === 0) return NextResponse.json({ success: false, error: 'No updates' }, { status: 400 })

      const querySql = `UPDATE production_orders SET ${updates.join(', ')} WHERE ${schema.pkCol} = ?`
      params.push(recordId)

      await connection.query(querySql, params)
      return NextResponse.json({ success: true })
    } finally {
      connection.release()
    }
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id') || searchParams.get('pdoID')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })

    const connection = await pool.getConnection()
    try {
      const schema = await getProductionOrderSchema(connection)
      await connection.query(`DELETE FROM production_orders WHERE ${schema.pkCol} = ?`, [id])
    } finally {
      connection.release()
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 })
  }
}
