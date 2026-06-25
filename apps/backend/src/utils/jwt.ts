// https://www.npmjs.com/package/jsonwebtoken
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

export function generateJwt(user: JwtPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
    JWT_SECRET,
    { expiresIn: "1h" },
  );
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
