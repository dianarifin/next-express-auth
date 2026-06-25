import passport from "passport";
import { prisma } from "@repo/database/lib/prisma";
import googleStrategy from "../strategies/google-strategy";

// ============================================================
// SERIALIZE & DESERIALIZE — WAJIB untuk session-based auth
// ============================================================

passport.serializeUser((user: unknown, done) => {
  const u = user as { id: string };
  console.log("[Serialize] Menyimpan user.id ke session:", u.id);
  done(null, u.id);
});

passport.deserializeUser(async (id: string, done) => {
  console.log("[Deserialize] mengambil user dari DB, id: ", id);
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      console.log("[Deserialize] User tidak ditemukan di DB, id: ", id);
      return done(null, false);
    }

    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ============================================================
// DAFTARKAN STRATEGIES
// ============================================================
passport.use(googleStrategy);

export default passport;
