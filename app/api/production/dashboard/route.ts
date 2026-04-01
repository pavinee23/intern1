import { NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type StatShape = {
  totalOrders: number
  inProduction: number
  readyToShip: number
  shipped: number
  qualityTests: number
  materialsNeeded: number
  efficiency: number
  dailyOutput: number
  qaReports: number
  dailyIssues: number
}

type BranchKey = 'korea' | 'thailand' | 'vietnam' | 'malaysia' | 'brunei'

const ORDER_BRANCH_TABLES: Record<Exclude<BranchKey, 'korea'>, string> = {
  thailand: 'production_orders',
  vietnam: 'production_orders_vietnam',
  malaysia: 'production_orders_malaysia',
  brunei: 'production_orders_brunei',
}

const IN_PRODUCTION_STATUSES = new Set(['pending', 'in_progress', 'processing', 'planned', 'submitted', 'draft'])
const READY_TO_SHIP_STATUSES = new Set(['approved', 'completed', 'done', 'ready', 'confirmed'])
const SHIPPED_STATUSES = new Set(['shipped', 'in_transit', 'delivered', 'completed', 'done'])

function emptyStat(): StatShape {
  return {
    totalOrders: 0,
    inProduction: 0,
    readyToShip: 0,
    shipped: 0,
    qualityTests: 0,
    materialsNeeded: 0,
    efficiency: 0,
    dailyOutput: 0,
    qaReports: 0,
    dailyIssues: 0,
  }
}

function normalizeBranchFromOrder(orderNo: string): BranchKey | null {
  const code = String(orderNo || '').toUpperCase()
  if (code.startsWith('PDOTH')) return 'thailand'
  if (code.startsWith('PDOVT') || code.startsWith('PDOVN')) return 'vietnam'
  if (code.startsWith('PDOML') || code.startsWith('PDOMY')) return 'malaysia'
  if (code.startsWith('PDOBN')) return 'brunei'
  if (code.startsWith('PDOKR')) return 'korea'
  return null
}

function safeNum(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

async function tableExists(tableName: string) {
  const rows = await query(
    `SELECT COUNT(*) AS total
       FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = ?`,
    [tableName]
  ) as Array<{ total?: number }>
  return safeNum(rows?.[0]?.total) > 0
}

async function getTableColumns(tableName: string) {
  const rows = await query(`SHOW COLUMNS FROM \`${tableName}\``) as Array<{ Field?: string }>
  return new Set(rows.map((row) => String(row.Field || '')))
}

async function aggregateOrderTable(tableName: string) {
  const stat = emptyStat()
  if (!(await tableExists(tableName))) return stat
  const columns = await getTableColumns(tableName)

  const statusCol = columns.has('status') ? 'status' : null
  const qtyCol = ['quantity_ordered', 'quantity', 'target_qty', 'targetQty'].find((c) => columns.has(c)) || null
  const createdCol = ['created_at', 'orderDate', 'pdoDate', 'poDate'].find((c) => columns.has(c)) || null

  if (statusCol) {
    const rows = await query(
      `SELECT LOWER(COALESCE(\`${statusCol}\`, 'pending')) AS status_key, COUNT(*) AS total
         FROM \`${tableName}\`
        GROUP BY LOWER(COALESCE(\`${statusCol}\`, 'pending'))`
    ) as Array<{ status_key?: string; total?: number }>

    for (const row of rows) {
      const status = String(row.status_key || '').trim()
      const total = safeNum(row.total)
      stat.totalOrders += total
      if (IN_PRODUCTION_STATUSES.has(status)) stat.inProduction += total
      if (READY_TO_SHIP_STATUSES.has(status)) stat.readyToShip += total
    }
  } else {
    const rows = await query(`SELECT COUNT(*) AS total FROM \`${tableName}\``) as Array<{ total?: number }>
    stat.totalOrders = safeNum(rows?.[0]?.total)
  }

  if (qtyCol && createdCol) {
    const rows = await query(
      `SELECT COALESCE(SUM(COALESCE(\`${qtyCol}\`,0)),0) AS total
         FROM \`${tableName}\`
        WHERE DATE(\`${createdCol}\`) = CURDATE()`
    ) as Array<{ total?: number }>
    stat.dailyOutput = safeNum(rows?.[0]?.total)
  }

  return stat
}

async function aggregateKoreaOrders() {
  const stat = emptyStat()
  if (!(await tableExists('kr_production_orders'))) return stat
  const columns = await getTableColumns('kr_production_orders')
  const statusCol = columns.has('status') ? 'status' : null
  const qtyCol = columns.has('quantity') ? 'quantity' : null
  const branchCol = columns.has('branch') ? 'branch' : null
  const createdCol = ['orderDate', 'created_at', 'dueDate'].find((c) => columns.has(c)) || null

  if (!statusCol) {
    const countRows = await query(`SELECT COUNT(*) AS total FROM kr_production_orders`) as Array<{ total?: number }>
    stat.totalOrders = safeNum(countRows?.[0]?.total)
    return stat
  }

  const branchWhere = branchCol ? `WHERE LOWER(COALESCE(\`${branchCol}\`, 'korea')) LIKE '%korea%'` : ''

  const rows = await query(
    `SELECT LOWER(COALESCE(\`${statusCol}\`, 'pending')) AS status_key, COUNT(*) AS total
       FROM kr_production_orders
      ${branchWhere}
      GROUP BY LOWER(COALESCE(\`${statusCol}\`, 'pending'))`
  ) as Array<{ status_key?: string; total?: number }>

  for (const row of rows) {
    const status = String(row.status_key || '').trim()
    const total = safeNum(row.total)
    stat.totalOrders += total
    if (IN_PRODUCTION_STATUSES.has(status)) stat.inProduction += total
    if (READY_TO_SHIP_STATUSES.has(status)) stat.readyToShip += total
  }

  if (qtyCol && createdCol) {
    const qtyRows = await query(
      `SELECT COALESCE(SUM(COALESCE(\`${qtyCol}\`,0)),0) AS total
         FROM kr_production_orders
         ${branchWhere ? `${branchWhere} AND` : 'WHERE'} DATE(\`${createdCol}\`) = CURDATE()`
    ) as Array<{ total?: number }>
    stat.dailyOutput = safeNum(qtyRows?.[0]?.total)
  }

  return stat
}

async function aggregateShipmentsByBranch() {
  const shippedByBranch: Record<BranchKey, number> = {
    korea: 0,
    thailand: 0,
    vietnam: 0,
    malaysia: 0,
    brunei: 0,
  }

  const shipmentTables = ['kr_production_shipments', 'kr_domestic_shipments', 'kr_int_shipments', 'kr_shipment_updates']
  for (const table of shipmentTables) {
    if (!(await tableExists(table))) continue
    const columns = await getTableColumns(table)
    const orderNoCol = columns.has('orderNumber') ? 'orderNumber' : null
    const statusCol = columns.has('status') ? 'status' : (columns.has('currentStatus') ? 'currentStatus' : null)
    if (!statusCol) continue

    if (!orderNoCol) {
      const rows = await query(
        `SELECT LOWER(COALESCE(\`${statusCol}\`, '')) AS status_key, COUNT(*) AS total
           FROM \`${table}\`
          GROUP BY LOWER(COALESCE(\`${statusCol}\`, ''))`
      ) as Array<{ status_key?: string; total?: number }>
      const shippedTotal = rows
        .filter((r) => SHIPPED_STATUSES.has(String(r.status_key || '').trim()))
        .reduce((sum, row) => sum + safeNum(row.total), 0)
      shippedByBranch.korea += shippedTotal
      continue
    }

    const rows = await query(
      `SELECT \`${orderNoCol}\` AS order_no, LOWER(COALESCE(\`${statusCol}\`, '')) AS status_key
         FROM \`${table}\``
    ) as Array<{ order_no?: string; status_key?: string }>

    for (const row of rows) {
      if (!SHIPPED_STATUSES.has(String(row.status_key || '').trim())) continue
      const branch = normalizeBranchFromOrder(String(row.order_no || '')) || 'korea'
      shippedByBranch[branch] += 1
    }
  }

  return shippedByBranch
}

async function aggregateQaByBranch() {
  const qaByBranch: Record<BranchKey, number> = { korea: 0, thailand: 0, vietnam: 0, malaysia: 0, brunei: 0 }
  if (!(await tableExists('kr_qa_reports'))) return qaByBranch
  const rows = await query(`SELECT orderNumber, station, status FROM kr_qa_reports`) as Array<{ orderNumber?: string; station?: string; status?: string }>
  for (const row of rows) {
    const status = String(row.status || '').toLowerCase().trim()
    if (status !== 'pass' && status !== 'pending' && status !== 'fail') continue
    const fromOrder = normalizeBranchFromOrder(String(row.orderNumber || ''))
    if (fromOrder) {
      qaByBranch[fromOrder] += 1
      continue
    }
    const station = String(row.station || '').toLowerCase()
    if (station.includes('thailand')) qaByBranch.thailand += 1
    else if (station.includes('vietnam')) qaByBranch.vietnam += 1
    else if (station.includes('malaysia')) qaByBranch.malaysia += 1
    else if (station.includes('brunei')) qaByBranch.brunei += 1
    else qaByBranch.korea += 1
  }
  return qaByBranch
}

async function aggregateMaterialsNeededByBranch() {
  const byBranch: Record<BranchKey, number> = { korea: 0, thailand: 0, vietnam: 0, malaysia: 0, brunei: 0 }
  if (!(await tableExists('purchase_requests'))) return byBranch
  const rows = await query(
    `SELECT LOWER(COALESCE(branch,'')) AS branch_key, LOWER(COALESCE(status,'pending')) AS status_key, COUNT(*) AS total
       FROM purchase_requests
      GROUP BY LOWER(COALESCE(branch,'')), LOWER(COALESCE(status,'pending'))`
  ) as Array<{ branch_key?: string; status_key?: string; total?: number }>
  for (const row of rows) {
    const status = String(row.status_key || '').trim()
    if (!(status === 'pending' || status === 'submitted' || status === 'draft')) continue
    const b = String(row.branch_key || '').trim()
    const total = safeNum(row.total)
    if (b.includes('thailand') || b === 'th') byBranch.thailand += total
    else if (b.includes('vietnam') || b === 'vt' || b === 'vn') byBranch.vietnam += total
    else if (b.includes('malaysia') || b === 'ml' || b === 'my') byBranch.malaysia += total
    else if (b.includes('brunei') || b === 'bn') byBranch.brunei += total
    else byBranch.korea += total
  }
  return byBranch
}

function finalizeEfficiency(stat: StatShape): StatShape {
  const efficiency = stat.totalOrders > 0 ? Math.min(100, Number(((stat.shipped / stat.totalOrders) * 100).toFixed(1))) : 0
  return { ...stat, efficiency }
}

export async function GET() {
  try {
    const branchStats: Record<BranchKey, StatShape> = {
      korea: emptyStat(),
      thailand: emptyStat(),
      vietnam: emptyStat(),
      malaysia: emptyStat(),
      brunei: emptyStat(),
    }

    branchStats.korea = { ...branchStats.korea, ...(await aggregateKoreaOrders()) }
    for (const [branchKey, tableName] of Object.entries(ORDER_BRANCH_TABLES) as Array<[Exclude<BranchKey, 'korea'>, string]>) {
      branchStats[branchKey] = { ...branchStats[branchKey], ...(await aggregateOrderTable(tableName)) }
    }

    const shippedByBranch = await aggregateShipmentsByBranch()
    const qaByBranch = await aggregateQaByBranch()
    const materialsByBranch = await aggregateMaterialsNeededByBranch()

    for (const key of Object.keys(branchStats) as BranchKey[]) {
      branchStats[key].shipped = shippedByBranch[key] || 0
      branchStats[key].qualityTests = qaByBranch[key] || 0
      branchStats[key].qaReports = qaByBranch[key] || 0
      branchStats[key].materialsNeeded = materialsByBranch[key] || 0
      branchStats[key].dailyIssues = 0
      branchStats[key] = finalizeEfficiency(branchStats[key])
    }

    const summary = finalizeEfficiency(
      (Object.keys(branchStats) as BranchKey[]).reduce((acc, key) => {
        const row = branchStats[key]
        return {
          totalOrders: acc.totalOrders + row.totalOrders,
          inProduction: acc.inProduction + row.inProduction,
          readyToShip: acc.readyToShip + row.readyToShip,
          shipped: acc.shipped + row.shipped,
          qualityTests: acc.qualityTests + row.qualityTests,
          materialsNeeded: acc.materialsNeeded + row.materialsNeeded,
          efficiency: 0,
          dailyOutput: acc.dailyOutput + row.dailyOutput,
          qaReports: acc.qaReports + row.qaReports,
          dailyIssues: acc.dailyIssues + row.dailyIssues,
        }
      }, emptyStat())
    )

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      summary,
      branches: branchStats,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
