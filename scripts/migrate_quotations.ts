import { pool } from '../lib/mysql'
import * as fs from 'fs'
import * as path from 'path'

async function migrate() {
  try {
    console.log('Running quotations migration...')

    const sql = fs.readFileSync(
      path.join(process.cwd(), 'database_schemas/alter_quotations_add_customer_details.sql'),
      'utf8'
    )

    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 80)}...`)
      await pool.query(statement)
    }

    console.log('✓ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('✗ Migration failed:', error)
    process.exit(1)
  }
}

migrate()
