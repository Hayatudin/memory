import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { poolConnection } from "./db/index.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Memory REST API server running on port ${env.PORT} [${env.NODE_ENV}]`);
  console.log(`📡 Health check available at: http://localhost:${env.PORT}/health`);
  console.log(`🔐 Better Auth endpoint at: http://localhost:${env.PORT}/api/auth`);
});

// Graceful shutdown handling
async function shutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Closing server gracefully...`);
  server.close(async () => {
    console.log("🔌 HTTP server closed.");
    try {
      await poolConnection.end();
      console.log("🗄️ MySQL connection pool closed.");
      process.exit(0);
    } catch (err) {
      console.error("❌ Error during database pool shutdown:", err);
      process.exit(1);
    }
  });

  // Force close after 10s if dangling connections
  setTimeout(() => {
    console.error("⚠️ Forcefully terminating after timeout.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
