import { Router } from "express";
import passport from "@/config/passport";
import { authenticateJwt } from "@/middleware/authenticate-jwt";
import { googleCallback, getMe, logout } from "./auth.controller";

const router = Router();

// ============================================================
// MULAI LOGIN GOOGLE
// ============================================================
// Redirect user ke Google consent screen
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] }),
);

router.get("/google/callback", googleCallback);

router.get("/me", authenticateJwt, getMe);

router.get("/logout", logout);

export default router;
