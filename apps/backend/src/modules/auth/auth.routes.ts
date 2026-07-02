import passport from "@/config/passport";
import { authenticateJwt } from "@/middleware/authenticate-jwt";
import { Router } from "express";
import {
  getMe,
  googleCallback,
  loginWithEmailController,
  logout,
  registerController,
  resendVerificationController,
  verifyEmailController,
} from "./auth.controller";

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

// email and password
router.post("/login", loginWithEmailController);
router.post("/register", registerController);

// email verification
router.get("/verify-email", verifyEmailController);
router.get(
  "/resend-verification",
  authenticateJwt,
  resendVerificationController,
);

// protected
router.get("/me", authenticateJwt, getMe);
router.get("/logout", authenticateJwt, logout);

export default router;
