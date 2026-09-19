import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER || "root",
    database: process.env.DATABASE_NAME || "memory_db",
    ...(process.env.DATABASE_PASSWORD ? { password: process.env.DATABASE_PASSWORD } : {}),
    ...(process.env.DATABASE_SSL === "true" ? { ssl: { rejectUnauthorized: false } } : {}),
  },
  verbose: true,
  strict: true,
});
