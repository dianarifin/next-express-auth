// https://www.npmjs.com/package/jsonwebtoken
import type { JwtPayload } from "@repo/database/types/types";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function generateJwt(user: JwtPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      provider: user.provider,
    },
    JWT_SECRET,
    { expiresIn: "1d" },
  );
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
