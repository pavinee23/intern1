import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')
    const calcID = searchParams.get('calcID')
    const cusID = searchParams.get('cusID')

    // ตรวจสอบภาษา
    const lang = searchParams.get('lang') || 'th';
    let query = `
      SELECT
        p.calcID,
        p.power_calcuNo,
        p.title,
        p.parameters,
        p.result,
        p.created_by,
        p.created_at,
        p.cusID,
        COALESCE(c.fullname, '-') as customerName
      FROM power_calculations p
      LEFT JOIN cus_detail c ON p.cusID = c.cusID
      WHERE 1=1
    `

    const params: any[] = []

    if (calcID) {
      query += ` AND calcID = ?`
      params.push(calcID)
    }

    if (cusID) {
      query += ` AND cusID = ?`
      params.push(cusID)
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await pool.query(query, params)
    // ถ้าต้องการรองรับชื่อภาษาอังกฤษ/ไทย สามารถปรับตรงนี้ได้ (เช่น fullname_en, fullname_th)

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM power_calculations WHERE 1=1`
    const countParams: any[] = []

    if (calcID) {
      countQuery += ` AND calcID = ?`
      countParams.push(calcID)
    }

    if (cusID) {
      countQuery += ` AND cusID = ?`
      countParams.push(cusID)
    }

    const [countResult] = await pool.query(countQuery, countParams)
    const total = (countResult as any)[0].total

    return NextResponse.json({
      success: true,
      rows,
      total,
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Power calculations API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      parameters,
      result,
      created_by,
      cusID,
      power_calcuNo,
      usage_history,
      pre_inst_id
    } = body

    // Validate required field
    if (!power_calcuNo) {
      return NextResponse.json(
        { success: false, error: 'power_calcuNo is required' },
        { status: 400 }
      )
    }

    // Check if power_calcuNo already exists
    const [existingResult] = await pool.query(
      'SELECT calcID FROM power_calculations WHERE power_calcuNo = ?',
      [power_calcuNo]
    )
    if ((existingResult as any[]).length > 0) {
      return NextResponse.json(
        { success: false, error: 'Power Calcu No already exists. Please refresh to get a new number.' },
        { status: 400 }
      )
    }

    // Store usage_history and pre_inst_id in parameters
    const enrichedParameters = {
      ...parameters,
      usage_history,
      pre_inst_id
    }

    const query = `
      INSERT INTO power_calculations (
        power_calcuNo, title, parameters, result, created_by, cusID
      ) VALUES (?, ?, ?, ?, ?, ?)
    `

    const [insertResult] = await pool.query(query, [
      power_calcuNo,
      title || 'Untitled Calculation',
      JSON.stringify(enrichedParameters),
      JSON.stringify(result || {}),
      created_by || 'system',
      cusID || null
    ])

    return NextResponse.json({
      success: true,
      calcID: (insertResult as any).insertId,
      powerCalcuNo: power_calcuNo
    })
  } catch (error: any) {
    console.error('Create power calculation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      calcID,
      title,
      parameters,
      result,
      cusID
    } = body

    if (!calcID) {
      return NextResponse.json(
        { success: false, error: 'calcID is required' },
        { status: 400 }
      )
    }

    const query = `
      UPDATE power_calculations
      SET
        title = ?,
        parameters = ?,
        result = ?,
        cusID = ?
      WHERE calcID = ?
    `

    await pool.query(query, [
      title || 'Untitled Calculation',
      JSON.stringify(parameters || {}),
      JSON.stringify(result || {}),
      cusID || null,
      calcID
    ])

    return NextResponse.json({
      success: true,
      calcID
    })
  } catch (error: any) {
    console.error('Update power calculation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const calcID = searchParams.get('calcID')

    if (!calcID) {
      return NextResponse.json(
        { success: false, error: 'calcID is required' },
        { status: 400 }
      )
    }

    const query = `DELETE FROM power_calculations WHERE calcID = ?`
    await pool.query(query, [calcID])

    return NextResponse.json({
      success: true,
      calcID
    })
  } catch (error: any) {
    console.error('Delete power calculation error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
