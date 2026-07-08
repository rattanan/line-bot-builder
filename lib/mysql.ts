import { createPool, Pool, PoolConnection } from "mysql2/promise";

/**
 * MySQL connection pool configuration
 * Uses environment variables for credentials - never hardcode them
 */
const mysqlConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "line_legal_bot",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

let pool: Pool | null = null;

/**
 * Get MySQL connection pool instance
 * Creates pool if not already initialized
 */
export function getMySQLPool(): Pool {
  if (!pool) {
    pool = createPool(mysqlConfig);
  }
  return pool;
}

/**
 * Test database connection
 * Returns true if connection is successful, false otherwise
 */
export async function testMySQLConnection(): Promise<boolean> {
  try {
    const connection = await getMySQLPool().getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error("MySQL connection test failed:", error);
    return false;
  }
}

/**
 * Query result type for INSERT statements
 */
export type QueryResult<T = any> = {
  rows: T[];
  insertId?: number;
};

/**
 * Execute a query with connection pooling
 */
export async function executeQuery<T = any>(
  sql: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const connection = await getMySQLPool().getConnection();
  try {
    const [rows, fields] = await connection.execute(sql, params);
    // @ts-ignore - insertId is available on ResultSetHeader
    const insertId = (rows as any).insertId;
    return { rows: rows as T[], insertId } as QueryResult<T>;
  } finally {
    connection.release();
  }
}
