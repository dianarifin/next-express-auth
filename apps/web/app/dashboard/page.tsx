"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchMe, type UserData } from "@/lib/api";
import { DashboardNavbar } from "@/components/dashboard/navbar";
import { StatCard } from "@/components/dashboard/stat-card";
import { UserProfileCard } from "@/components/dashboard/user-profile-card";
import { Spinner } from "@/components/dashboard/spinner";
import { RouteNav } from "@/components/dashboard/route-nav";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      // ini akan menyimpan token ke browser
      localStorage.setItem("token", tokenFromUrl);
      // ini akan menghapus token dari url /dashboard?token="jagsdf"
      // sehingga jauh lebih sederhana
      window.history.replaceState({}, "", "/dashboard");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/");
      return;
    }

    fetchMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("token");
        router.replace("/");
      })
      .finally(() => setLoading(false));
  }, [router, searchParams]);

  function handleLogout() {
    localStorage.removeItem("token");
    router.replace("/");
  }

  if (loading) return <Spinner />;
  if (!user) return null;

  const firstName = user.name?.split(" ")[0] ?? "Pengguna";

  return (
    <div className="min-h-screen w-full bg-canvas">
      <DashboardNavbar onLogout={handleLogout} />

      <main className="mx-auto w-full max-w-2xl px-5 sm:px-6 py-8 sm:py-10 flex flex-col gap-7">
        {/* Welcome heading */}
        <div className="animate-fade-up">
          <p className="font-mono text-[12px] text-accent uppercase tracking-[1.2px] mb-1.5">
            Dashboard
          </p>
          <h1 className="text-[26px] sm:text-[28px] font-normal text-ink leading-tight tracking-tight">
            Halo, {firstName}
          </h1>
          <p className="text-sm text-body-mid mt-2">
            Berikut ringkasan informasi akun Anda.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Status" value="Aktif" delay={80} />
          <StatCard
            label="Provider"
            value={user.provider ? user.provider : "local"}
            delay={140}
          />
          <StatCard label="Role" value={user.role} delay={200} />
        </div>

        {/* User profile card */}
        <div className="animate-fade-up" style={{ animationDelay: "260ms" }}>
          <p className="font-mono text-[12px] text-body-mid uppercase tracking-[1.2px] mb-3">
            Profil Akun
          </p>
          <UserProfileCard user={user} />
          {/* Route navigation */}
          <RouteNav userRole={user.role} />
        </div>

        {/* Session status */}
        <div
          className="animate-fade-up flex items-center justify-center gap-2 text-xs text-body-mid"
          style={{ animationDelay: "340ms" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Sesi aktif &middot; Token tersimpan dengan aman
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <DashboardContent />
    </Suspense>
  );
}
