import { NextRequest, NextResponse } from 'next/server'
import { queryUser } from '@/lib/mysql-user'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/kenergy/user-feedback
 * บันทึก feedback จากผู้ใช้
 * Body: {
 *   userId?: number (optional for anonymous feedback)
 *   category: string (Suggestion | Bug Report | Feature Request | General Feedback)
 *   subject: string
 *   message: string
 *   rating: number (0-5)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, category, subject, message, rating } = body

    // Validate required fields
    if (!category || !subject || !message) {
      return NextResponse.json({
        success: false,
        error: 'category, subject, and message are required'
      }, { status: 400 })
    }

    // Validate category
    const validCategories = ['Suggestion', 'Bug Report', 'Feature Request', 'General Feedback']
    if (!validCategories.includes(category)) {
      return NextResponse.json({
        success: false,
        error: `category must be one of: ${validCategories.join(', ')}`
      }, { status: 400 })
    }

    // Validate rating
    const numRating = rating !== undefined ? Number(rating) : 0
    if (numRating < 0 || numRating > 5) {
      return NextResponse.json({
        success: false,
        error: 'rating must be between 0 and 5'
      }, { status: 400 })
    }

    // Insert feedback
    const result = await queryUser(`
      INSERT INTO user_feedback (user_id, category, subject, message, rating, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      userId || null,
      category,
      subject,
      message,
      numRating,
      userId ? `user_${userId}` : 'anonymous'
    ])

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback!',
      feedbackId: (result as any)[0]?.insertId
    })
  } catch (err: any) {
    console.error('User feedback API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to submit feedback'
    }, { status: 500 })
  }
}

/**
 * GET /api/kenergy/user-feedback
 * ดึง feedback ทั้งหมด (สำหรับ admin)
 * Query params:
 *   - status: Pending | Reviewed | Resolved
 *   - category: Suggestion | Bug Report | Feature Request | General Feedback
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    let sql = `
      SELECT
        f.id,
        f.user_id,
        f.category,
        f.subject,
        f.message,
        f.rating,
        f.status,
        f.created_at,
        u.name as user_name,
        u.email as user_email
      FROM user_feedback f
      LEFT JOIN user_list u ON f.user_id = u.userId
      WHERE 1=1
    `
    const params: any[] = []

    if (status) {
      sql += ' AND f.status = ?'
      params.push(status)
    }

    if (category) {
      sql += ' AND f.category = ?'
      params.push(category)
    }

    sql += ' ORDER BY f.created_at DESC LIMIT 100'

    const feedbacks = await queryUser(sql, params)

    return NextResponse.json({
      success: true,
      count: feedbacks.length,
      feedbacks
    })
  } catch (err: any) {
    console.error('Get feedback API error:', err)
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to fetch feedback'
    }, { status: 500 })
  }
}
