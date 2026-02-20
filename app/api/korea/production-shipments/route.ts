import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/mysql'

export async function GET() {
  try {
    const rows: any[] = await query('SELECT * FROM kr_production_shipments ORDER BY created_at DESC') as any[]
    return NextResponse.json(rows.map(r => ({
      ...r,
      items: r.items ? JSON.parse(r.items) : [],
    })))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, shipmentNumber, orderNumber, destination, destinationCode, destinationAddress, status, shipDate, estimatedDelivery, carrier, trackingNumber, priority, items } = body
    await query(
      `INSERT INTO kr_production_shipments (id,shipmentNumber,orderNumber,destination,destinationCode,destinationAddress,status,shipDate,estimatedDelivery,carrier,trackingNumber,priority,items)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, shipmentNumber, orderNumber, destination ?? 'Korea', destinationCode ?? 'KR', destinationAddress ?? '', status ?? 'packed', shipDate ?? null, estimatedDelivery, carrier ?? null, trackingNumber ?? null, priority ?? 'normal', JSON.stringify(items ?? [])]
    )
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status, shipDate, carrier, trackingNumber } = body
    await query(
      `UPDATE kr_production_shipments SET status=?, shipDate=?, carrier=?, trackingNumber=? WHERE id=?`,
      [status, shipDate ?? null, carrier ?? null, trackingNumber ?? null, id]
    )
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
