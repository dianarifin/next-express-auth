import passport from "passport";
import googleStrategy from "@/strategies/google.strategy";

// SERIALIZE & DESERIALIZE — WAJIB untuk session-based auth
// serializeUser: menyimpan user.id ke session
// saat ini tidak perlu serialize karena kita memakai pendekatan jwt

// passport.serializeUser((user: unknown, done) => {
//   const u = user as { id: string };
//   console.log("[Serialize] Menyimpan user.id ke session:", u.id);
//   done(null, u.id);
// });

// deserializeUser: mengambil user dari DB berdasarkan id yang tersimpan di session
// session di simpan di cookie, dan session store di server (default memory store, bisa diganti dengan redis, db, dll)
// saat ini tidak perlu DESERIALIZE karena kita memakai pendekatan jwt

// passport.deserializeUser(async (id: string, done) => {
//   console.log("[Deserialize] mengambil user dari DB, id: ", id);
//   try {
//     const user = await prisma.user.findUnique({
//       where: {
//         id,
//       },
//     });
//     if (!user) {
//       console.log("[Deserialize] User tidak ditemukan di DB, id: ", id);
//       return done(null, false);
//     }

//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });

// DAFTARKAN STRATEGIES
passport.use(googleStrategy);

export default passport;
