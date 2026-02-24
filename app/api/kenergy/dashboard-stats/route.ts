import { NextRequest, NextResponse } from 'next/server'
import { queryKsave } from '@/lib/mysql-ksave'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get site parameter from query string
    const { searchParams } = new URL(request.url)
    const site = searchParams.get('site') || 'thailand'

    // 1. Get total devices count for selected site
    const totalDevicesResult = await queryKsave(
      'SELECT COUNT(*) as count FROM devices WHERE site = ?',
      [site]
    )
    const totalDevices = totalDevicesResult[0]?.count || 0

    // 2. Get online devices count (devices with recent power records within last 20 minutes) for selected site
    const onlineDevicesResult = await queryKsave(
      `SELECT COUNT(DISTINCT d.deviceID) as count
       FROM devices d
       LEFT JOIN power_records p ON d.deviceID = p.device_id
       WHERE d.site = ? AND p.record_time >= NOW() - INTERVAL 20 MINUTE`,
      [site]
    )
    const onlineDevices = onlineDevicesResult[0]?.count || 0
    const offlineDevices = totalDevices - onlineDevices

    // 3. Get total energy saved this month (kWh) for selected site
    const energySavedResult = await queryKsave(
      `SELECT SUM(pr.energy_reduction) as total_energy
       FROM power_records pr
       JOIN devices d ON pr.device_id = d.deviceID
       WHERE d.site = ?
       AND MONTH(pr.record_time) = MONTH(NOW())
       AND YEAR(pr.record_time) = YEAR(NOW())`,
      [site]
    )
    const energySaved = Math.round(energySavedResult[0]?.total_energy || 0)

    // 4. Get recent devices (last 6) for selected site
    const recentDevices = await queryKsave(
      `SELECT
        d.deviceID,
        d.deviceName,
        d.location,
        d.ipAddress,
        d.ksaveID,
        p.record_time,
        p.before_L1,
        p.before_L2,
        p.before_L3,
        p.metrics_L1,
        p.metrics_L2,
        p.metrics_L3
       FROM devices d
       LEFT JOIN (
         SELECT device_id, record_time, before_L1, before_L2, before_L3,
                metrics_L1, metrics_L2, metrics_L3
         FROM power_records
         WHERE (device_id, record_time) IN (
           SELECT device_id, MAX(record_time)
           FROM power_records
           GROUP BY device_id
         )
       ) p ON d.deviceID = p.device_id
       WHERE d.site = ?
       ORDER BY p.record_time DESC
       LIMIT 6`,
      [site]
    )

    // 5. Calculate connection status for each device
    const devicesWithStatus = recentDevices.map((device: any) => {
      const lastUpdate = device.record_time ? new Date(device.record_time) : null
      const now = new Date()
      const isOnline = lastUpdate && (now.getTime() - lastUpdate.getTime()) < 20 * 60 * 1000 // 20 minutes

      return {
        deviceID: device.deviceID,
        deviceName: device.deviceName,
        location: device.location,
        ipAddress: device.ipAddress,
        ksaveID: device.ksaveID,
        isOnline,
        lastUpdate: device.record_time,
        voltageLL: isOnline ? [
          device.before_L1 || 0,
          device.before_L2 || 0,
          device.before_L3 || 0
        ] : [0, 0, 0]
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalDevices,
          onlineDevices,
          offlineDevices,
          energySaved
        },
        recentDevices: devicesWithStatus
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch dashboard stats'
    }, { status: 500 })
  }
}
