import passport from "passport";
import { prisma } from "@repo/database/lib/prisma";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";

// ============================================================
// GOOGLE STRATEGY
// ============================================================

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
    // passReqToCallback: true, -> ini tidak diperlukan karena kita tidak butuh req di callback
  },
  async (
    _accessToken: string,
    _refreshToken: string,
    profile: unknown,
    done: (err: unknown, user?: unknown) => void,
  ) => {
    // Implementasi login dengan Google
    // Misalnya, mencari user di database berdasarkan email yang diterima dari Google
    // Jika user tidak ditemukan, buat user baru
    // Kembalikan user yang ditemukan atau dibuat
    try {
      const p = profile as {
        id: string;
        emails: { value: string }[];
        displayName: string;
        photos: { value: string }[];
      };

      console.log(
        "[Google StraStrategy] Menerima profil dari Google:",
        p.id,
        p.displayName,
      );

      let user = await prisma.user.findUnique({
        where: { googleId: p.id },
      });

      if (!user) {
        console.log("[Google Strategy] Membuat user baru");
        user = await prisma.user.create({
          data: {
            googleId: p.id,
            email: p.emails?.[0]?.value ?? "",
            name: p.displayName,
            avatarUrl: p.photos?.[0]?.value ?? null,
            provider: "google",
          },
        });
      } else {
        console.log("[Google Strategy] User sudah ada");
      }

      return done(null, user);
    } catch (err) {
      console.error(
        "[Google Strategy] Error saat mencari/menyimpan user:",
        err,
      );
      return done(err, undefined);
    }
  },
);

export default googleStrategy;
