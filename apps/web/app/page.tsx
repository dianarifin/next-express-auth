import Link from "next/link";

interface RouteItem {
  label: string;
  href: string;
  description: string;
  icon: string;
}

const routes: RouteItem[] = [
  {
    label: "Login",
    href: "/login",
    description: "Masuk ke akun Anda",
    icon: "⇶",
  },
  {
    label: "Register",
    href: "/register",
    description: "Buat akun baru",
    icon: "♺",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    description: "Ringkasan akun dan statistik",
    icon: "◈",
  },
  {
    label: "Posts",
    href: "/posts",
    description: "Jelajahi semua postingan",
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
  },
  {
    label: "Verify Email",
    href: "/verify-email",
    description: "Verifikasi alamat email",
    icon: "◎",
  },
];

export default function Homepage() {

  return (
  <div className="min-h-screen w-full bg-canvas">
       {/* Header */}
       <header className="border-b border-hairline">
         <div className="mx-auto flex max-w-2xl items-center justify-between px-5 sm:px-6 h-[60px]">
           <div className="flex items-center gap-2.5">
             <div className="size-7 flex items-center justify-center bg-ink rounded-sm">
               <span className="text-canvas font-normal text-[11px]">A</span>
             </div>
             <span className="text-[15px] font-normal text-ink tracking-tight">
               Auth App
             </span>
           </div>
         </div>
       </header>

       {/* Hero */}
       <main className="mx-auto w-full max-w-2xl px-5 sm:px-6 py-10 sm:py-14 flex flex-col gap-8">
         <div className="animate-fade-up">
           <p className="font-mono text-[12px] text-accent uppercase tracking-[1.2px] mb-1.5">
             Next.js + Express
           </p>
           <h1 className="text-[28px] sm:text-[32px] font-normal text-ink leading-tight tracking-tight">
             Halaman Utama
           </h1>
           <p className="text-sm text-body-mid mt-2">
             Pilih menu di bawah untuk menjelajahi fitur aplikasi.
           </p>
        </div>

        {/*Route grid */}
        <div>
          {routes.map((route) => (
            <Link key={route.href} href={route.href} className="group flex items-start gap-3 border border-hairline bg-surface px-4 py-3.5 transition-all duration-150 hover:border-ink/20 hover:bg-surface-container active:translate-y-px" >
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
       </main>
      </div>
  )
}
