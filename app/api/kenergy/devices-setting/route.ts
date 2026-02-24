import { NextRequest, NextResponse } from 'next/server'
import { queryKsave } from '@/lib/mysql-ksave'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/kenergy/devices-setting
 * ดึงข้อมูลอุปกรณ์พร้อมสถานะ realtime
 * Query params:
 *   - site: thailand | korea | all
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const site = searchParams.get('site') || 'thailand'

    const devices = await queryKsave(`
      SELECT
        d.deviceID,
        d.deviceName,
        d.ksaveID,
        d.U_email as owner,
        d.location,
        d.ipAddress,
        d.latitude,
        d.longitude,
        d.site,
        d.created_at as registerDate,
        MAX(p.record_time) as lastUpdate,
        TIMESTAMPDIFF(SECOND, MAX(p.record_time), NOW()) as secondsSinceUpdate,
        CASE
          WHEN MAX(p.record_time) >= NOW() - INTERVAL 20 MINUTE THEN 'ONLINE'
          ELSE 'OFFLINE'
        END as connection
      FROM devices d
      LEFT JOIN power_records p ON d.deviceID = p.device_id
      WHERE d.location LIKE ? OR ? = 'all'
      GROUP BY d.deviceID, d.deviceName, d.ksaveID, d.U_email, d.location,
               d.ipAddress, d.latitude, d.longitude, d.site, d.created_at
      ORDER BY d.deviceName ASC
    `, [
      site === 'thailand' ? '%Thailand%' : (site === 'korea' ? '%Korea%' : '%'),
      site
    ])

    // Format time since update
    const formattedDevices = devices.map((d: any) => ({
      ...d,
      type: 'Energy 3-Ph', // Default type
      rssi: 0, // Not available yet
      ramData: false, // Not available yet
      timeSinceUpdate: d.secondsSinceUpdate ? formatTimeSince(d.secondsSinceUpdate) : 'N/A',
      lastUpdate: d.lastUpdate || null,
      registerDate: d.registerDate ? new Date(d.registerDate).toISOString().split('T')[0] : null
    }))

    return NextResponse.json({
      success: true,
      count: formattedDevices.length,
      devices: formattedDevices
    })
  } catch (err: any) {
    console.error('Devices setting API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to fetch devices'
    }, { status: 500 })
  }
}

/**
 * PUT /api/kenergy/devices-setting
 * อัพเดทข้อมูลอุปกรณ์
 * Body: { deviceId, deviceName?, location?, owner?, ipAddress?, latitude?, longitude? }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { deviceId, deviceName, location, owner, ipAddress, latitude, longitude } = body

    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: 'deviceId is required'
      }, { status: 400 })
    }

    // Build update query dynamically
    const updates: string[] = []
    const params: any[] = []

    if (deviceName !== undefined) {
      updates.push('deviceName = ?')
      params.push(deviceName)
    }
    if (location !== undefined) {
      updates.push('location = ?')
      params.push(location)
    }
    if (owner !== undefined) {
      updates.push('U_email = ?')
      params.push(owner)
    }
    if (ipAddress !== undefined) {
      updates.push('ipAddress = ?')
      params.push(ipAddress)
    }
    if (latitude !== undefined) {
      updates.push('latitude = ?')
      params.push(latitude)
    }
    if (longitude !== undefined) {
      updates.push('longitude = ?')
      params.push(longitude)
    }

    if (updates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fields to update'
      }, { status: 400 })
    }

    updates.push('updated_at = NOW()')
    params.push(deviceId)

    await queryKsave(`
      UPDATE devices
      SET ${updates.join(', ')}
      WHERE deviceID = ?
    `, params)

    return NextResponse.json({
      success: true,
      message: 'Device updated successfully'
    })
  } catch (err: any) {
    console.error('Update device error:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to update device'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/kenergy/devices-setting
 * ลบอุปกรณ์
 * Query params: deviceId
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const deviceId = searchParams.get('deviceId')

    if (!deviceId) {
      return NextResponse.json({
        success: false,
        error: 'deviceId is required'
      }, { status: 400 })
    }

    await queryKsave('DELETE FROM devices WHERE deviceID = ?', [deviceId])

    return NextResponse.json({
      success: true,
      message: 'Device deleted successfully'
    })
  } catch (err: any) {
    console.error('Delete device error:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to delete device'
    }, { status: 500 })
  }
}

// Helper function to format time difference
function formatTimeSince(seconds: number): string {
  if (seconds < 60) return `${seconds} secs ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} mins ago`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours < 24) return `${hours}:${String(mins).padStart(2, '0')} hrs. ago`
  const days = Math.floor(hours / 24)
  const hrs = hours % 24
  return `${days}d ${hrs}:${String(mins % 60).padStart(2, '0')} hrs. ago`
}
