import type { UserPublic } from "@repo/database/types/types";

export const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export type UserData = UserPublic;

export async function fetchMe(token: string): Promise<UserData> {
  const res = await fetch(`${BACKEND}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Unauthorized");
  const data = (await res.json()) as { user: UserData };
  return data.user;
}
