import { migrate } from "drizzle-orm/mysql2/migrator";
import { db, poolConnection } from "./index.js";

async function runMigrations() {
  try {
    console.log("⏳ Applying Drizzle migrations to MySQL...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Drizzle migrations applied successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await poolConnection.end();
  }
}

runMigrations();
