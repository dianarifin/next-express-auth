import { LoginCard } from "@/components/auth/login-card";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-50 to-zinc-100 px-4 py-12">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 size-96 rounded-full bg-brand/5 blur-3xl animate-float"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 size-80 rounded-full bg-brand/5 blur-3xl animate-float-delayed"
      />

      {/* Subtle grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 48px)," +
            "repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 48px)",
        }}
      />

      <LoginCard />
    </div>
  );
}
