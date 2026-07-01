import { LoginCard } from "@/components/auth/login-card";
import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-authenticated";

export default function LoginPage() {
  return (
    <RedirectIfAuthenticated>
    <div className="w-full h-screen flex items-center justify-center  bg-neutral-900">
      <LoginCard />
      </div>
    </RedirectIfAuthenticated>
  );
}
