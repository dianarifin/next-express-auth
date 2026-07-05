"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { UserWithCreatedAt } from "@repo/database/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";
import { ChangeRoleButton } from "./change-role-button";

// fetch all Users
async function fetchUsers(): Promise<UserWithCreatedAt[]> {
  const res = await apiFetch("/auth/users", { method: "GET" });
  const data = (await res.json()) as { users: UserWithCreatedAt[] };
  return data.users;
}

// user table skeleton
function UserTableSkeleton() {
  return (
    <div className="divide-y divide-hairline">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-6 py-4 animate-pulse"
        >
          <div className="size-10 rounded-full bg-surface-soft" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 rounded bg-surface-soft" />
            <div className="h-2.5 w-48 rounded bg-surface-soft" />
          </div>
          <div className="h-6 w-20 rounded bg-surface-soft" />
        </div>
      ))}
    </div>
  );
}

// list of users
export function UserTable() {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5, // 5 menit
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <Users className="size-5 text-body-mid" />
          <CardTitle>Daftar Pengguna</CardTitle>
          {users && <Badge variant="muted">{users.length}</Badge>}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        {isLoading && <UserTableSkeleton />}

        {error && (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-hazard-red">
              Gagal memuat data pengguna
            </p>
          </div>
        )}

        {!isLoading && !error && users?.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Users className="size-8 mx-auto text-body-mid/40 mb-2" />
            <p className="text-sm text-body-mid">Belum ada pengguna</p>
          </div>
        )}

        {!isLoading && !error && users && users.length > 0 && (
          <div className="divide-y divide-hairline">
            {users.map((user, i) => (
              <div
                key={user.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-canvas-soft/30 transition-colors duration-150 animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Avatar src={user.avatarUrl} name={user.name} size={40} />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink truncate leading-snug">
                    {user.name ?? "—"}
                  </p>
                  <p className="text-xs text-body-mid truncate mt-0.5">
                    {user.email}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={user.role === "ADMIN" ? "accent" : "muted"}>
                    {user.role}
                  </Badge>
                  <ChangeRoleButton userId={user.id} currentRole={user.role} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
