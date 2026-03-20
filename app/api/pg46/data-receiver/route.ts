import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import { ResultSetHeader } from 'mysql2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/pg46/data-receiver
 * 
 * รับข้อมูลจาก Progress PG46 RS485 Power Meter
 * และบันทึกลงตาราง power_records
 * 
 * Request Body Format:
 * {
 *   "device_id": 1,
 *   "before_meter_no": "MTR001",
 *   "metrics_meter_no": "MTR002",
 *   "record_time": "2026-03-20T14:30:00",
 *   "before": {
 *     "L1": 220.5,
 *     "L2": 221.0,
 *     "L3": 219.8,
 *     "kWh": 1234.567,
 *     "P": 150.5,
 *     "Q": 50.2,
 *     "S": 158.7,
 *     "PF": 0.95,
 *     "THD": 2.1,
 *     "F": 50.0
 *   },
 *   "metrics": {
 *     "L1": 220.2,
 *     "L2": 220.8,
 *     "L3": 219.5,
 *     "kWh": 1000.234,
 *     "P": 120.3,
 *     "Q": 40.1,
 *     "S": 126.8,
 *     "PF": 0.95,
 *     "THD": 1.8,
 *     "F": 50.0
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  let connection;
  
  try {
    const body = await request.json()
    const {
      device_id,
      before_meter_no,
      metrics_meter_no,
      record_time,
      before,
      metrics
    } = body

    // Validate required fields
    if (!device_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: device_id'
      }, { status: 400 })
    }

    // Use current timestamp if not provided
    const timestamp = record_time || new Date().toISOString().slice(0, 19).replace('T', ' ')

    // Get next ID
    const [rows] = await pool.query('SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM power_records')
    const nextId = (rows as any[])[0]?.next_id || 1

    // Insert data into power_records
    const insertQuery = `
      INSERT INTO power_records (
        id,
        device_id,
        before_meter_no,
        metrics_meter_no,
        record_time,
        before_L1, before_L2, before_L3, before_kWh, before_P, before_Q, before_S, before_PF, before_THD, before_F,
        metrics_L1, metrics_L2, metrics_L3, metrics_kWh, metrics_P, metrics_Q, metrics_S, metrics_PF, metrics_THD, metrics_F,
        created_by
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?
      )
    `

    const values = [
      nextId,
      device_id,
      before_meter_no || null,
      metrics_meter_no || null,
      timestamp,
      // Before values
      before?.L1 || null,
      before?.L2 || null,
      before?.L3 || null,
      before?.kWh || null,
      before?.P || null,
      before?.Q || null,
      before?.S || null,
      before?.PF || null,
      before?.THD || null,
      before?.F || null,
      // Metrics values
      metrics?.L1 || null,
      metrics?.L2 || null,
      metrics?.L3 || null,
      metrics?.kWh || null,
      metrics?.P || null,
      metrics?.Q || null,
      metrics?.S || null,
      metrics?.PF || null,
      metrics?.THD || null,
      metrics?.F || null,
      'PG46 RS485'
    ]

    const [result] = await pool.execute<ResultSetHeader>(insertQuery, values)

    // Calculate energy reduction (will be auto-calculated by MySQL GENERATED column)
    const energy_reduction = (before?.kWh || 0) - (metrics?.kWh || 0)
    const co2_reduction = energy_reduction * 0.5135

    console.log(`✅ PG46 Data saved: device_id=${device_id}, id=${nextId}, energy_reduction=${energy_reduction.toFixed(3)} kWh`)

    return NextResponse.json({
      success: true,
      message: 'Data saved successfully',
      data: {
        id: nextId,
        device_id,
        record_time: timestamp,
        energy_reduction: parseFloat(energy_reduction.toFixed(3)),
        co2_reduction: parseFloat(co2_reduction.toFixed(4)),
        inserted_id: result.insertId
      }
    })

  } catch (error: any) {
    console.error('❌ PG46 data receiver error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to save data',
      details: error.stack
    }, { status: 500 })
  }
}

/**
 * GET /api/pg46/data-receiver
 * 
 * ทดสอบ endpoint และดูรูปแบบข้อมูลที่ต้องส่ง
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/pg46/data-receiver',
    method: 'POST',
    description: 'รับข้อมูลจาก Progress PG46 RS485 Power Meter และบันทึกลง power_records',
    example_request: {
      device_id: 1,
      before_meter_no: 'MTR001',
      metrics_meter_no: 'MTR002',
      record_time: '2026-03-20T14:30:00',
      before: {
        L1: 220.5,
        L2: 221.0,
        L3: 219.8,
        kWh: 1234.567,
        P: 150.5,
        Q: 50.2,
        S: 158.7,
        PF: 0.95,
        THD: 2.1,
        F: 50.0
      },
      metrics: {
        L1: 220.2,
        L2: 220.8,
        L3: 219.5,
        kWh: 1000.234,
        P: 120.3,
        Q: 40.1,
        S: 126.8,
        PF: 0.95,
        THD: 1.8,
        F: 50.0
      }
    },
    fields: {
      device_id: 'required - รหัสอุปกรณ์',
      before_meter_no: 'optional - เลขที่มิเตอร์ก่อน',
      metrics_meter_no: 'optional - เลขที่มิเตอร์หลัง',
      record_time: 'optional - เวลาบันทึก (ถ้าไม่ระบุจะใช้เวลาปัจจุบัน)',
      before: 'optional - ค่ากระแสไฟก่อนติดตั้ง K-Save',
      metrics: 'optional - ค่ากระแสไฟหลังติดตั้ง K-Save'
    },
    power_fields: {
      L1: 'แรงดันไฟฟ้า Phase 1 (V)',
      L2: 'แรงดันไฟฟ้า Phase 2 (V)',
      L3: 'แรงดันไฟฟ้า Phase 3 (V)',
      kWh: 'พลังงานสะสม (kWh)',
      P: 'กำลังไฟฟ้าจริง (kW)',
      Q: 'กำลังไฟฟ้ารีแอกทีฟ (kVAR)',
      S: 'กำลังไฟฟ้าปรากฏ (kVA)',
      PF: 'ค่าตัวประกอบกำลังไฟฟ้า (0-1)',
      THD: 'Total Harmonic Distortion (%)',
      F: 'ความถี่ (Hz)'
    }
  })
}
