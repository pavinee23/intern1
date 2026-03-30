import { NextRequest, NextResponse } from 'next/server'
import { queryKsave } from '@/lib/mysql-ksave'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Get historical current data for a device
 * Shows before and after current trends over time
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')
    const hours = parseInt(searchParams.get('hours') || '24')

    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: 'Device ID is required'
      }, { status: 400 })
    }

    // Get historical data
    const records = await queryKsave(
      `SELECT
        record_time,
        before_current_L1,
        before_current_L2,
        before_current_L3,
        metrics_L1,
        metrics_L2,
        metrics_L3
       FROM power_records
       WHERE device_id = ?
         AND record_time >= NOW() - INTERVAL ? HOUR
       ORDER BY record_time ASC`,
      [deviceId, hours]
    )

    // Format data for chart
    const chartData = records.map((record: any) => {
      const time = new Date(record.record_time)
      return {
        time: time.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        timestamp: time.getTime(),
        // Before values
        beforeL1: record.before_current_L1 ? parseFloat(record.before_current_L1) : null,
        beforeL2: record.before_current_L2 ? parseFloat(record.before_current_L2) : null,
        beforeL3: record.before_current_L3 ? parseFloat(record.before_current_L3) : null,
        beforeAvg: record.before_current_L1 && record.before_current_L2 && record.before_current_L3
          ? (parseFloat(record.before_current_L1) + parseFloat(record.before_current_L2) + parseFloat(record.before_current_L3)) / 3
          : null,
        // After values
        afterL1: record.metrics_L1 ? parseFloat(record.metrics_L1) : null,
        afterL2: record.metrics_L2 ? parseFloat(record.metrics_L2) : null,
        afterL3: record.metrics_L3 ? parseFloat(record.metrics_L3) : null,
        afterAvg: record.metrics_L1 && record.metrics_L2 && record.metrics_L3
          ? (parseFloat(record.metrics_L1) + parseFloat(record.metrics_L2) + parseFloat(record.metrics_L3)) / 3
          : null
      }
    })

    // Calculate statistics
    const latestRecord = records[records.length - 1]
    const stats = latestRecord ? {
      currentBefore: {
        L1: latestRecord.before_current_L1 ? parseFloat(latestRecord.before_current_L1) : null,
        L2: latestRecord.before_current_L2 ? parseFloat(latestRecord.before_current_L2) : null,
        L3: latestRecord.before_current_L3 ? parseFloat(latestRecord.before_current_L3) : null
      },
      currentAfter: {
        L1: latestRecord.metrics_L1 ? parseFloat(latestRecord.metrics_L1) : null,
        L2: latestRecord.metrics_L2 ? parseFloat(latestRecord.metrics_L2) : null,
        L3: latestRecord.metrics_L3 ? parseFloat(latestRecord.metrics_L3) : null
      }
    } : null

    return NextResponse.json({
      success: true,
      data: {
        deviceId,
        period: `${hours} hours`,
        dataPoints: chartData.length,
        chartData,
        stats
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Current history error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch current history'
    }, { status: 500 })
  }
}
