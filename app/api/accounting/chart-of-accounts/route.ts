import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'

// GET - ดึงข้อมูลผังบัญชีทั้งหมด
export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT
        id, code, name_th, name_en, account_type, sub_type,
        parent_code, account_alias, is_sub_account, is_active, department_split
      FROM acc_chart_of_accounts
      ORDER BY code
    `)
    return NextResponse.json({ ok: true, data: rows })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

// POST - เพิ่มบัญชีใหม่
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, name_th, name_en, account_type, sub_type, parent_code, account_alias, is_sub_account, department_split } = body

    if (!code || !name_th || !account_type) {
      return NextResponse.json(
        { ok: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน (เลขที่บัญชี, ชื่อไทย, ประเภท)' },
        { status: 400 }
      )
    }

    const [result]: any = await pool.query(
      `INSERT INTO acc_chart_of_accounts
       (code, name_th, name_en, account_type, sub_type, parent_code, account_alias, is_sub_account, department_split)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, name_th, name_en || null, account_type, sub_type || null,
       parent_code || null, account_alias || null, is_sub_account || 0, department_split || 'N']
    )

    return NextResponse.json({
      ok: true,
      message: 'เพิ่มบัญชีสำเร็จ',
      id: result.insertId
    })
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { ok: false, error: 'เลขที่บัญชีนี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      )
    }
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

// PUT - แก้ไขบัญชี
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, code, name_th, name_en, account_type, sub_type, parent_code, account_alias, is_sub_account, is_active, department_split } = body

    if (!id || !code || !name_th || !account_type) {
      return NextResponse.json(
        { ok: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    await pool.query(
      `UPDATE acc_chart_of_accounts
       SET code = ?, name_th = ?, name_en = ?, account_type = ?, sub_type = ?,
           parent_code = ?, account_alias = ?, is_sub_account = ?, is_active = ?, department_split = ?
       WHERE id = ?`,
      [code, name_th, name_en || null, account_type, sub_type || null,
       parent_code || null, account_alias || null, is_sub_account || 0,
       is_active !== undefined ? is_active : 1, department_split || 'N', id]
    )

    return NextResponse.json({ ok: true, message: 'แก้ไขบัญชีสำเร็จ' })
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { ok: false, error: 'เลขที่บัญชีนี้มีอยู่ในระบบแล้ว' },
        { status: 400 }
      )
    }
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}

// DELETE - ลบบัญชี
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'ไม่พบ ID ที่ต้องการลบ' },
        { status: 400 }
      )
    }

    // ตรวจสอบว่ามีบัญชีลูกหรือไม่
    const [children]: any = await pool.query(
      'SELECT COUNT(*) as count FROM acc_chart_of_accounts WHERE parent_code = (SELECT code FROM acc_chart_of_accounts WHERE id = ?)',
      [id]
    )

    if (children[0].count > 0) {
      return NextResponse.json(
        { ok: false, error: 'ไม่สามารถลบได้ เนื่องจากมีบัญชีย่อยอยู่' },
        { status: 400 }
      )
    }

    await pool.query('DELETE FROM acc_chart_of_accounts WHERE id = ?', [id])
    return NextResponse.json({ ok: true, message: 'ลบบัญชีสำเร็จ' })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
