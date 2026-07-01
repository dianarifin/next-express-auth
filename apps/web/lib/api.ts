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

export async function apiFetch(path: string, options: RequestInit) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BACKEND}${path}`, {
    ...options, //  `...options` — menyebar properti seperti `method`, `body`, `signal`, `credentials`, dll.
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers, // `...options.headers` — menyebar isi dari `headers` si caller.
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  return res;
}
