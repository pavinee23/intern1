import { NextRequest, NextResponse } from 'next/server'
import { queryKsave } from '@/lib/mysql-ksave'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const deviceId = searchParams.get('deviceId')

    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 })
    }

    // Get the latest power record for the device
    const powerRecords = await queryKsave(
      `SELECT
        device_id,
        record_time,
        before_L1,
        before_L2,
        before_L3,
        metrics_L1,
        metrics_L2,
        metrics_L3,
        metrics_P_L1,
        metrics_P_L2,
        metrics_P_L3,
        metrics_P,
        metrics_Q,
        metrics_S,
        metrics_F,
        metrics_PF,
        metrics_kWh,
        energy_reduction,
        co2_reduction,
        before_kWh
       FROM power_records
       WHERE device_id = ?
       ORDER BY record_time DESC
       LIMIT 1`,
      [deviceId]
    )

    if (powerRecords.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No monitoring data found for this device'
      }, { status: 404 })
    }

    const record = powerRecords[0]

    // Map to MonitorCard format
    const monitoringData = {
      deviceId: record.device_id,
      lastUpdate: record.record_time,
      metrics: {
        // Voltage (Line-to-Line)
        voltageLL: [
          record.before_L1 || 0,
          record.before_L2 || 0,
          record.before_L3 || 0
        ],
        // Current (Line)
        current: [
          record.metrics_L1 || 0,
          record.metrics_L2 || 0,
          record.metrics_L3 || 0
        ],
        // Active Power per phase (kW)
        power: [
          record.metrics_P_L1 || 0,
          record.metrics_P_L2 || 0,
          record.metrics_P_L3 || 0
        ],
        // Total Active Power (kW)
        totalPower: record.metrics_P || 0,
        // Reactive Power (kVAr)
        reactivePower: record.metrics_Q || 0,
        // Apparent Power (kVA)
        apparentPower: record.metrics_S || 0,
        // Frequency (Hz)
        frequency: record.metrics_F || 0,
        // Power Factor
        powerFactor: record.metrics_PF || 0,
        // Energy consumption (kWh)
        energy: record.metrics_kWh || 0,
        // Energy saved (kWh)
        energySaved: record.energy_reduction || 0,
        // CO2 reduction (kg)
        co2Saved: record.co2_reduction || 0,
        // Before optimization energy (kWh)
        beforeEnergy: record.before_kWh || 0
      }
    }

    return NextResponse.json({
      success: true,
      data: monitoringData,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Device monitoring error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch monitoring data'
    }, { status: 500 })
  }
}
