"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchMe, type UserData } from "@/lib/api";
import { Spinner } from "@/components/dashboard/spinner";
import { DashboardNavbar } from "@/components/dashboard/navbar";
import { UserTable } from "@/components/users/user-table";

function UsersPageContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/");
      return;
    }

    fetchMe(token)
      .then((currentUser) => {
        setUser(currentUser);

        // bukan admin -> redirect ke dashboard
        if (currentUser.role !== "ADMIN") {
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        router.replace("/");
      })
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    router.replace("/");
  }

  if (loading) return <Spinner />;
  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-canvas">
      <DashboardNavbar onLogout={handleLogout} />

      <main className="mx-auto w-full max-w-2xl px-5 sm:px-6 py-8 sm:py-10 flex flex-col gap-7">
        {/* Header */}
        <div className="animate-fade-up">
          <p className="font-mono text-[12px] text-accent uppercase tracking-[1.2px] mb-1.5">
            Admin Panel
          </p>
          <h1 className="text-[26px] sm:text-[28px] font-normal text-ink leading-tight tracking-tight">
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-body-mid mt-2">
            Kelola role dan akses pengguna di platform.
          </p>
        </div>

        {/* User table — data fetching via TanStack Query di dalamnya */}
        <div className="animate-scale-in" style={{ animationDelay: "60ms" }}>
          <UserTable />
        </div>
      </main>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <UsersPageContent />
    </Suspense>
  );
}
