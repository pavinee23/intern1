import mysql from 'mysql2/promise'

// Create a connection pool for MySQL
// Connection pool settings can be configured via environment variables
const connectionLimit = parseInt(process.env.MYSQL_CONNECTION_LIMIT || '10')
const queueLimit = parseInt(process.env.MYSQL_QUEUE_LIMIT || '50')

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  database: process.env.MYSQL_DATABASE || 'ksystem',
  user: process.env.MYSQL_USER || 'ksystem',
  password: process.env.MYSQL_PASSWORD || 'Ksave2025Admin',
  waitForConnections: true,
  connectionLimit,
  queueLimit,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  timezone: '+00:00'
})

// Log pool configuration on startup
console.log(`[MySQL Pool] Configured with connectionLimit=${connectionLimit}, queueLimit=${queueLimit}`)

// Monitor connection pool usage every 30 seconds
let lastWarningTime = 0
setInterval(() => {
  try {
    const poolInfo = (pool as any).pool
    if (poolInfo) {
      const activeConnections = poolInfo._allConnections?.length || 0
      const freeConnections = poolInfo._freeConnections?.length || 0
      const queuedRequests = poolInfo._connectionQueue?.length || 0

      // Log if usage is high (>80% of limit)
      if (activeConnections > connectionLimit * 0.8) {
        const now = Date.now()
        // Only log warning once per minute to avoid spam
        if (now - lastWarningTime > 60000) {
          console.warn(`[MySQL Pool] High connection usage: ${activeConnections}/${connectionLimit} active, ${freeConnections} free, ${queuedRequests} queued`)
          lastWarningTime = now
        }
      }
    }
  } catch (e) {
    // Ignore monitoring errors
  }
}, 30000)

// Note: Pool error handling removed - mysql2/promise handles errors internally
// Errors will be caught and thrown in the query function below

// Note: Connection test removed for serverless compatibility
// Connections are created on-demand when needed

/**
 * Get connection pool statistics
 * @returns Pool statistics object
 */
export function getPoolStats() {
  try {
    const poolInfo = (pool as any).pool
    if (poolInfo) {
      const activeConnections = poolInfo._allConnections?.length || 0
      const freeConnections = poolInfo._freeConnections?.length || 0
      const queuedRequests = poolInfo._connectionQueue?.length || 0
      return {
        connectionLimit,
        queueLimit,
        activeConnections,
        freeConnections,
        queuedRequests,
        usagePercent: Math.round((activeConnections / connectionLimit) * 100)
      }
    }
  } catch (e) {
    console.error('Error getting pool stats:', e)
  }
  return {
    connectionLimit,
    queueLimit,
    activeConnections: 0,
    freeConnections: 0,
    queuedRequests: 0,
    usagePercent: 0
  }
}

/**
 * Convert PostgreSQL parameterized query ($1, $2, etc.) to MySQL (?) syntax
 */
function convertPostgresToMysql(sql: string): string {
  return sql.replace(/\$\d+/g, '?')
}

/**
 * Execute MySQL query with automatic retry
 * Supports both MySQL (?) and PostgreSQL ($1, $2) syntax
 * @param sql SQL query string (can use ? or $1, $2 placeholders)
 * @param values Query parameters (optional)
 * @param retries Number of retry attempts (default: 2)
 * @returns Query results
 */
export async function query(sql: string, values?: any[], retries = 2): Promise<any[]> {
  // Convert PostgreSQL syntax to MySQL if needed
  const convertedSql = convertPostgresToMysql(sql)
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    let connection: any = null

    try {
      // Get connection from pool
      connection = await pool.getConnection()

      // Execute query with converted SQL
      const [results] = await connection.query(convertedSql, values)

      return Array.isArray(results) ? results : [results]

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.error(`Database query error (attempt ${attempt + 1}/${retries + 1}):`, lastError.message)

      // If this is not the last attempt, wait before retrying
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)))
      }

    } finally {
      // Always release the connection back to the pool
      if (connection) {
        try {
          connection.release()
        } catch (releaseError) {
          console.error('Error releasing connection:', releaseError)
        }
      }
    }
  }

  // If all retries failed, throw the last error
  throw lastError || new Error('Query failed after retries')
}

// Export pool for advanced usage
export { pool }
