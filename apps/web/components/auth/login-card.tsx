import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { GoogleButton } from "@/components/auth/google-button";
import { TrustBadges } from "@/components/auth/trust-badges";

export function LoginCard() {
  return (
    <div className="animate-scale-in w-full max-w-[400px]">
      <Card>
        <CardContent className="flex flex-col items-center px-10 pt-10 pb-8">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center bg-gradient-to-br from-brand to-brand-hover shadow-[0_4px_12px_rgba(212,0,26,0.28)]">
              <span className="text-white font-black text-[17px] tracking-tight">
                A
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              AuthApp
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[23px] font-bold text-foreground text-center leading-tight">
            Selamat datang kembali
          </h1>
          <p className="mt-2 mb-9 text-center text-sm text-muted-foreground leading-relaxed">
            Masuk dengan akun Google Anda
            <br />
            untuk melanjutkan ke dashboard
          </p>

          {/* Google button */}
          <GoogleButton />

          {/* Divider */}
          <div className="relative my-7 w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">
                aman & terpercaya
              </span>
            </div>
          </div>

          {/* Trust points */}
          <TrustBadges />
        </CardContent>

        <CardFooter>
          <p className="text-xs text-muted-foreground text-center leading-relaxed w-full">
            Dengan masuk, Anda menyetujui{" "}
            <a
              href="#"
              className="text-foreground font-medium underline-offset-2 hover:underline transition-colors"
            >
              Syarat & Ketentuan
            </a>{" "}
            kami
          </p>
        </CardFooter>
      </Card>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} AuthApp. Semua hak dilindungi.
      </p>
    </div>
  );
}
