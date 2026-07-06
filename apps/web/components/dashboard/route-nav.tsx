"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface RouteItem {
  label: string;
  href: string;
  description: string;
  icon: string;
  adminOnly?: boolean;
}

const routes: RouteItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    description: "Ringkasan akun dan status sesi",
    icon: "◈",
  },
  {
     label: "Posts",
     href: "/posts",
     description: "Lihat semua postingan",
     icon: "⊞",
   },
   {
     label: "Buat Post",
     href: "/posts/new-post",
     description: "Tulis postingan baru",
     icon: "+",
   },
   {
     label: "Pengguna",
     href: "/users",
     description: "Manajemen pengguna (Admin)",
     icon: "⚇",
     adminOnly: true,
   },
   {
     label: "Login",
     href: "/login",
     description: "Halaman masuk akun",
     icon: "⇶",
   },
   {
     label: "Register",
     href: "/register",
     description: "Buat akun baru",
     icon: "♺",
   },
   {
     label: "Verify Email",
     href: "/verify-email",
     description: "Verifikasi alamat email",
     icon: "◎",
   },
]

interface RouteNavProps {
  userRole?: string;
}

export function RouteNav({ userRole }: RouteNavProps) {
  const filtered = userRole ? routes : routes.filter((r) => !r.adminOnly);

  return (
  <div className="animate-fade-up" style={{ animationDelay: "180ms" }}>
       <p className="font-mono text-[12px] text-body-mid uppercase tracking-[1.2px] mb-3">
         Navigasi Cepat
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
             {filtered.map((route) => (
               <Link
                 key={route.href}
                 href={route.href}
                 className={cn(
                   "group flex items-start gap-3 rounded-none border border-hairline",
                   "bg-surface px-4 py-3.5 transition-all duration-150",
                   "hover:border-ink/20 hover:bg-surface-container",
                   "active:translate-y-px",
                 )}
               >
                 <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center bg-surface-variant text-sm text-ink-muted group-hover:bg-surface-bright group-hover:text-ink transition-colors">
                   {route.icon}
                 </span>
                 <div className="min-w-0">
                   <p className="text-sm font-medium text-ink group-hover:text-white transition-colors">
                     {route.label}
                   </p>
                   <p className="text-xs text-body-mid mt-0.5 truncate">
                     {route.description}
                   </p>
                 </div>
               </Link>
             ))}
      </div>
  </div>
  )
}
