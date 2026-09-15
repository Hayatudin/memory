import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err.status || err.statusCode || 500;
  const isProd = env.NODE_ENV === "production";

  console.error(`[ERROR] ${req.method} ${req.url}:`, err);

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: isProd && statusCode === 500 ? "Internal Server Error" : err.message || "An unexpected error occurred",
      ...(isProd ? {} : { stack: err.stack }),
    },
  });
}
