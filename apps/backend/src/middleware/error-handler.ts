import { ensureLogsDir, logsDir } from "@/config/logger";
import { NextFunction, Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";

// Centralized error handler — Express 5 forwards async errors here automatically
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("[Error Handler]", err);
  const status = (err as { status?: number }).status ?? 500;
  const message = err instanceof Error ? err.message : "Internal server error";

  // Only log into file if the error return (5xx) - not 4xx from business logic
  if (status > 500) {
    console.error("[Error Handler]", err)

    if (process.env.NODE_ENV === "production") {
      ensureLogsDir()

      const timestamp = new Date().toISOString()
      const method = _req.method;
      const url = _req.originalUrl;
      const stack = err instanceof Error ? err.stack : "";
      const userInfo = _req.user
        ? `(user: ${(_req.user as { id?: string }).id})`
        : "(unauthenticated)";

      const logLine = `[${timestamp}] ${method} ${url} ${userInfo}\n  ${message}\n  ${stack}\n---\n`

      try {
        fs.appendFileSync(path.join(logsDir, "error.log"), logLine, "utf-8")
      } catch (writeErr) {
        console.error("[Error Handler] Gagal menulis ke error.log: ", writeErr)
      }
    }
  } else {
    // 4xx - cukup console log saja (tidak perlu file)
    console.warn(`[${status}] ${_req.method} ${_req.originalUrl} - ${message}`)
  }

  res.status(status).json({ error: message });
}
