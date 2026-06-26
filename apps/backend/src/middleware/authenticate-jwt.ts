import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";

export function authenticateJwt(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = verifyJwt(token);
    req.user = decoded; // simpan payload ke req.user
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
