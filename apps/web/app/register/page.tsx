import { RegisterCard } from "@/components/auth/register-card";
import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-authenticated";

export default function RegisterPage() {
  return (
    <RedirectIfAuthenticated>
      <div className="w-full h-screen flex items-center justify-center  bg-neutral-900">
        <RegisterCard />
      </div>
    </RedirectIfAuthenticated>
  );
}
