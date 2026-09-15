import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import { checkDatabaseConnection } from "../db/index.js";
import { UserController } from "../modules/user/user.controller.js";

const router = Router();

/**
 * Health Check Endpoint
 * Tests server state and active MySQL connectivity.
 */
router.get("/health", async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseConnection();

  if (!dbHealth.connected) {
    res.status(503).json({
      status: "degraded",
      database: "disconnected",
      error: dbHealth.error,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
    return;
  }

  res.json({
    status: "ok",
    database: "connected",
    databaseLatencyMs: dbHealth.latencyMs,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

/**
 * Authenticated Current User & Profile Endpoint
 */
router.get("/me", requireAuth, UserController.getMe);

export const apiRouter = router;
