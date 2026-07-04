import type { JwtPayload } from "@repo/database/types/types";
import jwt from "jsonwebtoken";

export function generateTestToken(overides: Partial<JwtPayload> = {}) {
  const defaults: JwtPayload = {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    avatarUrl: null,
    role: "USER",
    provider: "local",
    tokenVersion: 0,
    emailVerified: false
  };

  return jwt.sign({ ...defaults, ...overides }, process.env.JWT_SECRET!, {
    expiresIn: "1h"
  })
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}
