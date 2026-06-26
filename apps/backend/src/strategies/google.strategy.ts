import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { findOrCreateGoogleUser, GoogleProfile } from "@/modules/auth/auth.service";

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
      const p = profile as GoogleProfile;

      console.log(
        "[Google Strategy] Menerima profil dari Google:",
        p.id,
        p.displayName,
      );

      const user = await findOrCreateGoogleUser(p);
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
