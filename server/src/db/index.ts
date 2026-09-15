import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../config/env.js";
import * as schema from "./schema/index.js";

const poolConnection = mysql.createPool({
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(poolConnection, {
  schema,
  mode: "default",
});

export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const connection = await poolConnection.getConnection();
    await connection.ping();
    connection.release();
    return { connected: true, latencyMs: Date.now() - start };
  } catch (error: any) {
    return { connected: false, error: error.message || "Failed to connect to MySQL" };
  }
}

export { poolConnection };
