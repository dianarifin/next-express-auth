import { Router } from "express";
import passport from "../config/passport";

const router = Router();

// ============================================================
// MULAI LOGIN GOOGLE
// ============================================================
// Redirect user ke Google consent screen
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] }),
);

// callback google
// google redirect ke sini setelah user login
// passport otomatis
// 1. jalanin strategy -> cari/ buat user
// 2. serialize user.id ke session
// 3. redirect ke frontend

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard`,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:3000"}/login?error=auth_failed`,
  }),
);

// ============================================================
// CEK USER YANG SEDANG LOGIN
// ============================================================
router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Belum login" });
  }
  res.json({ user: req.user });
});

// ============================================================
// LOGOUT
// ============================================================
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.redirect(
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/login`,
      );
    });
  });
});

export default router;
