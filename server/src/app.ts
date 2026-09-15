import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";

export function createApp(): Express {
  const app = express();

  // Security & HTTP configuration
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(","),
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.all("/api/phone-debug", express.json(), (req: Request, res: Response) => {
    console.log("📱 [PHONE LOG]:", JSON.stringify(req.body));
    res.json({ ok: true });
  });

  // Better Auth handler - mounted before body parsers to allow Better Auth to handle raw stream payloads
  app.all("/api/auth/*", toNodeHandler(auth));

  // Request body parsers for application REST endpoints
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Mount API router
  app.use("/api", apiRouter);
  app.use(env.API_PREFIX, apiRouter);
  app.use(apiRouter);

  // 404 Not Found Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "The requested resource does not exist",
      },
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
