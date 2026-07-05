"use client";

import { apiFetch } from "@/lib/api";
import { Role } from "@repo/database/generated/prisma/enums";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, ChevronDown } from "lucide-react";

export function ChangeRoleButton({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newRole: "USER" | "ADMIN") => {
      const res = await apiFetch(`/auth/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to update role");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      setOpen(false);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="xs">
          <Shield className="size-3.5" />
          {currentRole}
          <ChevronDown className="size-3" />
        </Button>
      </DialogTrigger>

      <DialogContent className="md:min-w-100" >
        <DialogHeader>
          <DialogTitle>Ubah Role</DialogTitle>
          <DialogDescription>
            Pilih role baru untuk user ini. Hanya ADMIN yang memiliki akses
            penuh.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-2">
          {(["USER", "ADMIN"] as const).map((role) => (
            <button
              key={role}
              onClick={() => mutation.mutate(role)}
              disabled={mutation.isPending || role === currentRole}
              className="flex items-center gap-3 px-4 py-3 rounded-none border border-hairline bg-canvas hover:bg-surface-soft transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left"
            >
              <Shield
                className={`size-5 ${
                  role === "ADMIN" ? "text-accent" : "text-body-mid"
                }`}
              />
              <div>
                <p className="text-sm font-medium text-ink">{role}</p>
                <p className="text-xs text-body-mid mt-0.5">
                  {role === "ADMIN"
                    ? "Dapat mengelola user dan konten"
                    : "Akses standar sebagai pengguna biasa"}
                </p>
              </div>
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-hazard-red px-1">{error}</p>}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
