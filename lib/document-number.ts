import { pool } from '@/lib/mysql'

/**
 * สร้างเลขที่เอกสารอัตโนมัติตามรูปแบบ:
 * - Warranty: WT-TH-YYYYMM-####
 * - อื่นๆ: XX-YYYYMM-####
 * ใช้ตาราง document_counters เพื่อป้องกันการซ้ำกัน (thread-safe)
 * @param prefix รหัสประเภทเอกสาร (เช่น CN, GR, PV, WT)
 * @param tableName ชื่อตาราง (ไม่ใช้แล้ว แต่เก็บไว้เพื่อ backward compatibility)
 * @param fieldName ชื่อฟิลด์ที่เก็บเลขเอกสาร (ไม่ใช้แล้ว แต่เก็บไว้เพื่อ backward compatibility)
 * @returns เลขที่เอกสารใหม่
 */
export async function generateDocumentNumber(
  prefix: string,
  tableName: string,
  fieldName: string
): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const yearMonth = `${year}${month}`

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // ใช้ INSERT ... ON DUPLICATE KEY UPDATE เพื่อเพิ่ม counter แบบ atomic
    await connection.query(
      `INSERT INTO document_counters (prefix, \`year_month\`, counter)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE counter = counter + 1`,
      [prefix, yearMonth]
    )

    // อ่านค่า counter ล่าสุด
    const [rows]: any = await connection.query(
      `SELECT counter FROM document_counters
       WHERE prefix = ? AND \`year_month\` = ?`,
      [prefix, yearMonth]
    )

    await connection.commit()

    const counter = rows[0].counter
    const counterStr = String(counter).padStart(4, '0')

    // สร้างเลขเอกสารตามรูปแบบของแต่ละประเภท
    let docNumber: string
    if (prefix === 'WT') {
      // Warranty: WT-TH-YYYYMM-####
      docNumber = `${prefix}-TH-${yearMonth}-${counterStr}`
    } else {
      // เอกสารอื่นๆ: XX-YYYYMM-####
      docNumber = `${prefix}-${yearMonth}-${counterStr}`
    }

    return docNumber
  } catch (error) {
    await connection.rollback()
    console.error('Error generating document number:', error)
    throw error
  } finally {
    connection.release()
  }
}

/**
 * ตรวจสอบว่าเลขเอกสารซ้ำหรือไม่
 */
export async function isDocumentNumberExists(
  tableName: string,
  fieldName: string,
  docNumber: string
): Promise<boolean> {
  try {
    const [rows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM ${tableName} WHERE ${fieldName} = ?`,
      [docNumber]
    )
    return rows[0].count > 0
  } catch (error) {
    console.error('Error checking document number:', error)
    throw error
  }
}
