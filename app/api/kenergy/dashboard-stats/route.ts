import { NextRequest, NextResponse } from 'next/server'
import { queryKsave } from '@/lib/mysql-ksave'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RawRecentDevice = {
  deviceID: string
  deviceName: string
  customerName: string | null
  customerNameEn: string | null
  customerPhone: string | null
  customerAddress: string | null
  series_no: string | null
  metricsMeterNo: string | null
  beforeMeterNo: string | null
  location: string | null
  ipAddress: string | null
  ksaveID: string | null
  record_time: string | Date | null
  before_L1: number | string | null
  before_L2: number | string | null
  before_L3: number | string | null
  before_current_L1: number | string | null
  before_current_L2: number | string | null
  before_current_L3: number | string | null
  metrics_L1: number | string | null
  metrics_L2: number | string | null
  metrics_L3: number | string | null
  metrics_P: number | string | null
  metrics_Q: number | string | null
  metrics_S: number | string | null
  metrics_PF: number | string | null
  metrics_F: number | string | null
  metrics_kWh: number | string | null
  before_kWh: number | string | null
  before_P: number | string | null
  before_Q: number | string | null
  before_S: number | string | null
  before_PF: number | string | null
  before_F: number | string | null
  before_THD: number | string | null
  metrics_THD: number | string | null
  energy_reduction: number | string | null
  co2_reduction: number | string | null
}

type ColumnNameRow = {
  COLUMN_NAME: string
}

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

    // 4. Get latest record for all devices in the selected site
    // Some environments may still run an older power_records schema.
    // Build a safe SELECT list that falls back to NULL for missing columns.
    const optionalPowerColumns = [
      'before_current_L1',
      'before_current_L2',
      'before_current_L3',
      'before_THD',
      'metrics_THD',
      'metrics_P',
      'metrics_Q',
      'metrics_S',
      'metrics_PF',
      'metrics_F',
      'metrics_kWh',
      'before_kWh',
      'before_P',
      'before_Q',
      'before_S',
      'before_PF',
      'before_F',
      'energy_reduction',
      'co2_reduction'
    ]
    const placeholders = optionalPowerColumns.map(() => '?').join(', ')
    const availableColumnsRows = await queryKsave(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'power_records'
         AND COLUMN_NAME IN (${placeholders})`,
      optionalPowerColumns
    )
    const availableColumns = new Set(
      (availableColumnsRows as ColumnNameRow[]).map((row) => row.COLUMN_NAME)
    )
    const selectOptionalColumn = (columnName: string) => (
      availableColumns.has(columnName)
        ? `p.${columnName}`
        : `NULL AS ${columnName}`
    )

    // Check optional columns in devices table
    const optionalDeviceColumns = ['customerNameEn', 'customerPhone', 'customerAddress', 'series_no', 'metricsMeterNo', 'beforeMeterNo', 'location', 'ipAddress', 'ksaveID']
    const devicePlaceholders = optionalDeviceColumns.map(() => '?').join(', ')
    const availableDeviceColumnsRows = await queryKsave(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'devices'
         AND COLUMN_NAME IN (${devicePlaceholders})`,
      optionalDeviceColumns
    )
    const availableDeviceColumns = new Set(
      (availableDeviceColumnsRows as ColumnNameRow[]).map((row) => row.COLUMN_NAME)
    )
    const selectOptionalDeviceColumn = (columnName: string) => (
      availableDeviceColumns.has(columnName)
        ? `d.${columnName}`
        : `NULL AS ${columnName}`
    )

    const recentDevices = await queryKsave(
      `SELECT
        d.deviceID,
        d.deviceName,
        d.customerName,
        ${selectOptionalDeviceColumn('customerNameEn')},
        ${selectOptionalDeviceColumn('customerPhone')},
        ${selectOptionalDeviceColumn('customerAddress')},
        ${selectOptionalDeviceColumn('series_no')},
        ${selectOptionalDeviceColumn('metricsMeterNo')},
        ${selectOptionalDeviceColumn('beforeMeterNo')},
        ${selectOptionalDeviceColumn('location')},
        ${selectOptionalDeviceColumn('ipAddress')},
        ${selectOptionalDeviceColumn('ksaveID')},
        p.record_time,
        p.before_L1,
        p.before_L2,
        p.before_L3,
        ${selectOptionalColumn('before_current_L1')},
        ${selectOptionalColumn('before_current_L2')},
        ${selectOptionalColumn('before_current_L3')},
        p.metrics_L1,
        p.metrics_L2,
        p.metrics_L3,
        ${selectOptionalColumn('metrics_P')},
        ${selectOptionalColumn('metrics_Q')},
        ${selectOptionalColumn('metrics_S')},
        ${selectOptionalColumn('metrics_PF')},
        ${selectOptionalColumn('metrics_F')},
        ${selectOptionalColumn('metrics_kWh')},
        ${selectOptionalColumn('before_kWh')},
        ${selectOptionalColumn('before_P')},
        ${selectOptionalColumn('before_Q')},
        ${selectOptionalColumn('before_S')},
        ${selectOptionalColumn('before_PF')},
        ${selectOptionalColumn('before_F')},
        ${selectOptionalColumn('before_THD')},
        ${selectOptionalColumn('metrics_THD')},
        ${selectOptionalColumn('energy_reduction')},
        ${selectOptionalColumn('co2_reduction')}
       FROM devices d
       LEFT JOIN power_records p ON p.id = (
         SELECT pr.id
         FROM power_records pr
         WHERE pr.device_id = d.deviceID
         ORDER BY pr.record_time DESC, pr.id DESC
         LIMIT 1
       )
       WHERE d.site = ?
       ORDER BY p.record_time DESC, d.deviceID ASC`,
      [site]
    )

    // 5. Calculate connection status for each device
    const toNullableNumber = (value: number | string | null | undefined) => {
      if (value === null || value === undefined) return null
      const numericValue = Number(value)
      return Number.isFinite(numericValue) ? numericValue : null
    }

    const devicesWithStatus = (recentDevices as RawRecentDevice[]).map((device) => {
      const lastUpdate = device.record_time ? new Date(device.record_time) : null
      const now = new Date()
      const isOnline = lastUpdate && (now.getTime() - lastUpdate.getTime()) < 20 * 60 * 1000 // 20 minutes
      const currentABC = [
        toNullableNumber(device.metrics_L1),
        toNullableNumber(device.metrics_L2),
        toNullableNumber(device.metrics_L3)
      ]
      const beforeCurrentABC = [
        toNullableNumber(device.before_current_L1),
        toNullableNumber(device.before_current_L2),
        toNullableNumber(device.before_current_L3)
      ]
      const validCurrents = currentABC.filter((value): value is number => value !== null)
      const validBeforeCurrents = beforeCurrentABC.filter((value): value is number => value !== null)
      const avgCurrent = validCurrents.length > 0
        ? Number((validCurrents.reduce((sum, value) => sum + value, 0) / validCurrents.length).toFixed(1))
        : null
      const avgBeforeCurrent = validBeforeCurrents.length > 0
        ? Number((validBeforeCurrents.reduce((sum, value) => sum + value, 0) / validBeforeCurrents.length).toFixed(1))
        : null
      const currentReduction = avgBeforeCurrent && avgCurrent
        ? Number((((avgBeforeCurrent - avgCurrent) / avgBeforeCurrent) * 100).toFixed(1))
        : null
      const maxCurrent = validCurrents.length > 0 ? Math.max(...validCurrents) : null
      const minCurrent = validCurrents.length > 0 ? Math.min(...validCurrents) : null
      const imbalancePercent = maxCurrent && minCurrent !== null
        ? Number((((maxCurrent - minCurrent) / maxCurrent) * 100).toFixed(1))
        : null

      // Process THD values
      const metricsTHD = toNullableNumber(device.metrics_THD)
      const avgThd = metricsTHD !== null ? Number(metricsTHD.toFixed(1)) : null
      // Use average THD for each phase as approximation (since we don't have per-phase THD in DB)
      const thdABC = avgThd !== null ? [avgThd, avgThd, avgThd] : [null, null, null]

      return {
        deviceID: device.deviceID,
        deviceName: device.deviceName,
        customerName: device.customerName,
        customerNameEn: device.customerNameEn,
        customerPhone: device.customerPhone,
        customerAddress: device.customerAddress,
        seriesNo: device.series_no,
        metricsMeterNo: device.metricsMeterNo,
        beforeMeterNo: device.beforeMeterNo,
        location: device.location,
        ipAddress: device.ipAddress,
        ksaveID: device.ksaveID,
        isOnline,
        lastUpdate: device.record_time,
        voltageLL: [
          toNullableNumber(device.before_L1),
          toNullableNumber(device.before_L2),
          toNullableNumber(device.before_L3)
        ],
        currentABC,
        beforeCurrentABC,
        avgCurrent,
        avgBeforeCurrent,
        currentReduction,
        imbalancePercent,
        avgThd,
        thdABC,
        activePower:    toNullableNumber(device.metrics_P),
        reactivePower:  toNullableNumber(device.metrics_Q),
        apparentPower:  toNullableNumber(device.metrics_S),
        powerFactor:    toNullableNumber(device.metrics_PF),
        frequency:      toNullableNumber(device.metrics_F),
        energyKwh:      toNullableNumber(device.metrics_kWh),
        beforeKwh:      toNullableNumber(device.before_kWh),
        beforeActivePower:    toNullableNumber(device.before_P),
        beforeReactivePower:  toNullableNumber(device.before_Q),
        beforeApparentPower:  toNullableNumber(device.before_S),
        beforePowerFactor:    toNullableNumber(device.before_PF),
        beforeFrequency:      toNullableNumber(device.before_F),
        beforeThd:            toNullableNumber(device.before_THD),
        energyReduction: toNullableNumber(device.energy_reduction),
        co2Reduction:   toNullableNumber(device.co2_reduction)
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
  } catch (error: unknown) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats'
    }, { status: 500 })
  }
}
