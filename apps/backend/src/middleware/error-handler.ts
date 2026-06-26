import { Request, Response, NextFunction } from "express";

// Centralized error handler — Express 5 forwards async errors here automatically
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("[Error Handler]", err);
  const status = (err as { status?: number }).status ?? 500;
  const message =
    err instanceof Error ? err.message : "Internal server error";
  res.status(status).json({ error: message });
}
