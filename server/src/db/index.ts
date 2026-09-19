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
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 2000,
});

export const db = drizzle(poolConnection, {
  schema,
  mode: "default",
});

let isDbHealthy: boolean | null = null;
let lastCheckTime = 0;

export async function isDatabaseAvailable(): Promise<boolean> {
  const now = Date.now();
  if (isDbHealthy !== null && now - lastCheckTime < 15000) {
    return isDbHealthy;
  }
  lastCheckTime = now;
  try {
    const connPromise = poolConnection.getConnection();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Connection timeout")), 1500)
    );
    const connection: any = await Promise.race([connPromise, timeoutPromise]);
    await connection.ping();
    connection.release();
    isDbHealthy = true;
    return true;
  } catch {
    isDbHealthy = false;
    return false;
  }
}

export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const isAvail = await isDatabaseAvailable();
    if (!isAvail) {
      return { connected: false, error: "Database unreachable, active on local store" };
    }
    return { connected: true, latencyMs: Date.now() - start };
  } catch (error: any) {
    return { connected: false, error: error.message || "Failed to connect to MySQL" };
  }
}

export { poolConnection };
