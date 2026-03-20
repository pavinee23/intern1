import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/mysql'
import mysql from 'mysql2/promise'

// Database configuration for new connections (fallback)
const dbConfig = {
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'ksystem',
  password: process.env.MYSQL_PASSWORD || 'Ksave2025Admin',
  database: process.env.MYSQL_DATABASE || 'ksystem',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const site = searchParams.get('site') || 'Thailand'
    const search = searchParams.get('search') || ''

    // Query to get employees from Thailand site
    let query = `
      SELECT
        userId as id,
        userName as username,
        name,
        name_th,
        email,
        typeID,
        site,
        create_datetime as created_at
      FROM user_list
      WHERE site = ?
    `

    const params: any[] = [site]

    // Add search filter if provided
    if (search) {
      query += ` AND (name LIKE ? OR userName LIKE ? OR email LIKE ?)`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    query += ` ORDER BY userId DESC LIMIT 100`

    const [rows] = await pool.query(query, params)

    // Transform data to include department and position info
    const employees = (rows as any[]).map(emp => ({
      id: emp.id,
      username: emp.username,
      name: emp.name || emp.username,
      name_th: emp.name_th,
      email: emp.email,
      department: getDepartmentByTypeID(emp.typeID),
      position: getPositionByTypeID(emp.typeID),
      typeID: emp.typeID,
      site: emp.site,
      salary: 0, // Salary data would come from a separate table
      status: 'active',
      createdAt: emp.created_at
    }))

    return NextResponse.json({
      ok: true,
      employees,
      total: employees.length
    })

  } catch (error: any) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({
      ok: false,
      error: error.message || 'Failed to fetch employees'
    }, { status: 500 })
  }
}

// Helper function to map typeID to department
function getDepartmentByTypeID(typeID: number): string {
  const mapping: Record<number, string> = {
    1: 'ผู้ดูแลระบบ',
    2: 'ผู้จัดการ',
    3: 'บัญชี',
    4: 'การตลาด',
    5: 'ช่างเทคนิค',
    6: 'ฝ่ายขาย',
    7: 'แอดมิน',
    8: 'HR/เงินเดือน',
    9: 'การตลาด',
    10: 'ผู้จัดการสาขา',
    11: 'บัญชี',
    12: 'นักศึกษางาน',
  }
  return mapping[typeID] || 'ทั่วไป'
}

// Helper function to map typeID to position
function getPositionByTypeID(typeID: number): string {
  const mapping: Record<number, string> = {
    1: 'System Administrator',
    2: 'Manager',
    3: 'นักบัญชี',
    4: 'Marketing Staff',
    5: 'ช่างติดตั้ง',
    6: 'พนักงานขาย',
    7: 'Admin',
    8: 'HR Officer',
    9: 'หัวหน้าแผนกการตลาด (M-Marketing)',
    10: 'ผู้จัดการสาขา (Branch Manager)',
    11: 'หัวหน้าแผนกบัญชี (M-Accounting)',
    12: 'นักศึกษางาน (Internship)',
  }
  return mapping[typeID] || 'พนักงาน'
}

// POST - Create new employee
export async function POST(request: NextRequest) {
  let connection;

  try {
    const body = await request.json()
    const {
      username,
      password,
      name,
      email,
      typeID,
      site,
      salary,
      hourlyRate,
      dailyRate,
      startDate,
      documents
    } = body

    // Validate required fields
    if (!username || !password || !name || !typeID || !site) {
      return NextResponse.json({
        ok: false,
        error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อผู้ใช้, รหัสผ่าน, ชื่อ-นามสกุล, ตำแหน่ง, สาขา)'
      }, { status: 400 })
    }

    connection = await mysql.createConnection(dbConfig)

    // Check if username already exists
    const [existing] = await connection.execute(
      'SELECT userId FROM user_list WHERE userName = ?',
      [username]
    )

    if ((existing as any[]).length > 0) {
      return NextResponse.json({
        ok: false,
        error: 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว'
      }, { status: 400 })
    }

    // Hash password (simple MD5 - in production use bcrypt)
    const crypto = require('crypto')
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex')

    // Insert new employee into user_list table
    const insertQuery = `
      INSERT INTO user_list (
        userName,
        password,
        name,
        email,
        typeID,
        site,
        create_datetime
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `

    const [result] = await connection.execute(insertQuery, [
      username,
      hashedPassword,
      name,
      email || null,
      typeID,
      site
    ])

    const insertId = (result as any).insertId

    // If salary/hourly/daily rate is provided, insert into salary table (if exists)
    if ((salary && salary > 0) || (hourlyRate && hourlyRate > 0) || (dailyRate && dailyRate > 0)) {
      try {
        await connection.execute(
          `INSERT INTO employee_salary (userId, salary, hourlyRate, dailyRate, startDate, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            insertId,
            salary || 0,
            hourlyRate || 0,
            dailyRate || 0,
            startDate || new Date().toISOString().split('T')[0]
          ]
        )
      } catch (salaryError) {
        console.log('Salary table insert skipped:', salaryError)
        // Continue even if salary table doesn't exist
      }
    }

    // Save uploaded documents
    if (documents && typeof documents === 'object') {
      const docMapping: Record<string, string> = {
        contract: 'contract',
        education: 'education',
        idCard: 'idCard',
        bankAccount: 'bankAccount',
        resume: 'resume',
        certificate: 'certificate'
      }

      for (const [key, filePath] of Object.entries(documents)) {
        if (filePath && typeof filePath === 'string') {
          try {
            const fileName = filePath.split('/').pop() || ''
            await connection.execute(
              `INSERT INTO employee_documents (userId, doc_type, file_path, file_name, uploaded_at)
               VALUES (?, ?, ?, ?, NOW())`,
              [insertId, docMapping[key] || key, filePath, fileName]
            )
          } catch (docError) {
            console.log(`Document ${key} insert skipped:`, docError)
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: 'เพิ่มพนักงานสำเร็จ',
      employeeId: insertId,
      employee: {
        id: insertId,
        username,
        name,
        email,
        department: getDepartmentByTypeID(typeID),
        position: getPositionByTypeID(typeID),
        typeID,
        site,
        salary: salary || 0,
        status: 'active'
      }
    })

  } catch (error: any) {
    console.error('Error creating employee:', error)
    return NextResponse.json({
      ok: false,
      error: error.message || 'ไม่สามารถเพิ่มพนักงานได้'
    }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// PUT - Update existing employee
export async function PUT(request: NextRequest) {
  let connection;

  try {
    const body = await request.json()
    const {
      id,
      name,
      name_th,
      email
    } = body

    // Validate required fields
    if (!id || !name) {
      return NextResponse.json({
        ok: false,
        error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ID, ชื่อ-นามสกุล)'
      }, { status: 400 })
    }

    connection = await mysql.createConnection(dbConfig)

    // Check if employee exists
    const [existing] = await connection.execute(
      'SELECT userId FROM user_list WHERE userId = ?',
      [id]
    )

    if ((existing as any[]).length === 0) {
      return NextResponse.json({
        ok: false,
        error: 'ไม่พบข้อมูลพนักงานในระบบ'
      }, { status: 404 })
    }

    // Update employee data
    const updateQuery = `
      UPDATE user_list
      SET name = ?,
          name_th = ?,
          email = ?
      WHERE userId = ?
    `

    await connection.execute(updateQuery, [
      name,
      name_th || null,
      email || null,
      id
    ])

    return NextResponse.json({
      ok: true,
      message: 'อัพเดตข้อมูลพนักงานสำเร็จ',
      employee: {
        id,
        name,
        name_th,
        email
      }
    })

  } catch (error: any) {
    console.error('Error updating employee:', error)
    return NextResponse.json({
      ok: false,
      error: error.message || 'ไม่สามารถอัพเดตข้อมูลพนักงานได้'
    }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
