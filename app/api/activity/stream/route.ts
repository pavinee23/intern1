import { NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function formatRow(r: any) {
  return {
    type: r.type,
    title: r.title,
    ts: r.ts,
    ref_id: r.ref_id
  }
}

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let lastTs: string | null = null

      // initialize lastTs to latest activity timestamp to avoid flooding
      try {
        const conn = await pool.getConnection()
        try {
          const [rows]: any = await conn.query(`
            SELECT created_at AS ts FROM (
              SELECT created_at FROM purchase_orders
              UNION ALL
              SELECT created_at FROM cus_detail
              UNION ALL
              SELECT created_at FROM invoices
            ) x ORDER BY ts DESC LIMIT 1
          `)
          if (Array.isArray(rows) && rows.length) lastTs = rows[0].ts
        } catch (e) {
          console.error('init lastTs error', e)
        } finally {
          conn.release()
        }
      } catch (e) {
        console.error('pool getConnection error', e)
      }

      const poll = async () => {
        try {
          const conn = await pool.getConnection()
          try {
            const sql = `
              SELECT 'order' AS type, orderNo AS title, created_at AS ts, orderID AS ref_id FROM purchase_orders
              UNION ALL
              SELECT 'customer' AS type, fullname AS title, created_at AS ts, cusID AS ref_id FROM cus_detail
              UNION ALL
              SELECT 'invoice' AS type, invNo AS title, created_at AS ts, invID AS ref_id FROM invoices
              ORDER BY ts ASC
            `
            const [rows]: any = await conn.query(sql)
            const filtered = (Array.isArray(rows) ? rows : []).filter((r: any) => {
              if (!r.ts) return false
              if (!lastTs) return true
              return new Date(r.ts).getTime() > new Date(lastTs).getTime()
            })
            if (filtered.length) {
              for (const r of filtered) {
                const ev = formatRow(r)
                const payload = JSON.stringify(ev)
                try { controller.enqueue(encoder.encode(`data: ${payload}\n\n`)) } catch (_) { return }
                lastTs = r.ts
              }
            }
          } finally {
            conn.release()
          }
        } catch (e: any) {
          // Swallow connection errors silently — will retry on next interval
          if (!String(e).includes('Too many')) console.error('activity stream poll error', e)
        }
      }

      // send a ping every 30s to keep connection alive
      const pingInterval = setInterval(() => {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify({ ping: Date.now() })}\n\n`)) } catch (_) {}
      }, 30000)

      // poll every 10 seconds (reduce DB connection pressure)
      const interval = setInterval(poll, 10000)

      // run initial poll once
      await poll()

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ ready: true })}\n\n`))

      if (controller.signal && typeof controller.signal.addEventListener === 'function') {
        controller.signal.addEventListener('abort', () => {
          clearInterval(interval)
          clearInterval(pingInterval)
          try { controller.close() } catch (e) {}
        })
      }
    }
  })

  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  })
}
