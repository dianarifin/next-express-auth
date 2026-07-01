import { prisma } from "@repo/database/lib/prisma";
import { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt";

export async function authenticateJwt(
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

    // cek tokenVersion dari DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { tokenVersion: true },
    });

    if (!user || decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ error: "Token has been revoked" });
    }

    req.user = decoded; // simpan payload ke req.user
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
