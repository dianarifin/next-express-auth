import passport from "@/config/passport";
import { sendVerificationEmail } from "@/utils/email";
import { generateJwt } from "@/utils/jwt";
import { Role } from "@repo/database/generated/prisma/enums";
import { prisma } from "@repo/database/lib/prisma";
import { JwtPayload } from "@repo/database/types/types";
import { NextFunction, Request, Response } from "express";
import {
  generateVerificationToken,
  getAllUsers,
  loginWithEmail,
  registerUser,
  resendVerificationEmail,
  updateUserRole,
  verifyEmailWithToken,
} from "./auth.service";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// daftar sebagai pengguna baru
export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { name, email, password } = req.body;

    // validasi sederhana
    if (!name || !email || !password) {
      res.status(400).json({ error: "Nama, email, and password are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const user = await registerUser({ name, email, password });

    // generate token dan kirim email verifikasi
    try {
      const token = await generateVerificationToken(user.id);
      await sendVerificationEmail(user.email, user.name || "User", token);
    } catch (emailErr) {
      console.error("[Register] gagal kirim email verifikasi", emailErr);
      // Jangan gagalkan registrasi — user bisa minta kirim ulang nanti
    }

    // generate JWT langsung (auto-login setelah register)
    const token = generateJwt({
      id: user.id,
      email: user.email,
      name: user.name || "",
      avatarUrl: user.avatarUrl,
      role: user.role,
      provider: user.provider || "local",
      tokenVersion: user.tokenVersion,
      emailVerified: user.emailVerified,
    });

    // set httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
}

// verifikasi email via token
export async function verifyEmailController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: "Token is required" });
      return;
    }

    const user = await verifyEmailWithToken(token);

    res.json({
      message: "Email berhasil diverifikasi",
      emailVerified: true,
    });
  } catch (error) {
    next(error);
  }
}

// kirim ulang email verifikasi
export async function resendVerificationController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { user, token } = await resendVerificationEmail(userId);
    await sendVerificationEmail(user.email, user.name || "User", token);

    res.json({ message: "Email verifikasi telah dikirim ulang" });
  } catch (error) {
    next(error);
  }
}

// email / password login controller
export async function loginWithEmailController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await loginWithEmail(email, password);

    // generate JWT (sama seperti google login)
    const token = generateJwt({
      id: user.id,
      email: user.email,
      name: user.name || "",
      avatarUrl: user.avatarUrl,
      role: user.role,
      provider: user.provider || "local",
      tokenVersion: user.tokenVersion,
      emailVerified: user.emailVerified,
    });

    // set httpOnly cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 1000, // 7 hari
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GOOGLE CALLBACK
// ============================================================
// google redirect ke sini setelah user login
// passport otomatis
// 1. jalanin strategy -> cari/ buat user
// 2. serialize user.id ke session
// 3. redirect ke frontend

// Versi session-based (referensi):
// passport.authenticate("google", {
//   successRedirect: `${FRONTEND_URL}/dashboard`,
//   failureRedirect: `${FRONTEND_URL}/login?error=auth_failed`,
// })

export function googleCallback(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  passport.authenticate(
    "google",
    { session: false },
    (err: unknown, user: unknown) => {
      if (err || !user) {
        console.error("[Google Callback] Error:", err);
        return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
      }

      const u = user as JwtPayload;

      const token = generateJwt({
        id: u.id,
        email: u.email,
        name: u.name || "",
        avatarUrl: u.avatarUrl,
        role: u.role,
        provider: u.provider || "local",
        tokenVersion: u.tokenVersion ?? 0,
        emailVerified: u.emailVerified,
      });

      // SET cookie dari backend (port 3001) → browser simpan otomatis
      res.cookie("token", token, {
        httpOnly: true, // JS tidak bisa akses → aman dari XSS
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // biar bisa dikirim antar port
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
      });

      console.log("[JWT] Token generated untuk:", u.email);
      res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
    },
  )(req, res, next);
}

// ============================================================
// CEK USER YANG SEDANG LOGIN
// ============================================================
// akses routes ini secara tidak langsung akses melalui deserializeUser,
// karena passport akan otomatis memanggil deserializeUser untuk mengambil user dari session
// disini memakai pendekatan session-based auth, tapi kita bisa juga memakai pendekatan jwt-based auth
// router.get("/me", (req, res) => {
//   if (!req.isAuthenticated()) {
//     return res.status(401).json({ error: "Belum login" });
//   }
//   console.log("req.session yang ada: ", req.session);
//   console.log("req.user yang ada: ", req.user);
//   res.json({ user: req.user });
// });

// akses routes ini secara tidak langsung akses melalui authenticateJwt,
// karena authenticateJwt akan otomatis memanggil verifyJwt untuk mengambil user dari token
export function getMe(req: Request, res: Response) {
  res.json({ user: req.user });
}

// ============================================================
// LOGOUT
// ============================================================
// pendekatan session-based auth, jadi logout dengan menghapus session di server dan cookie di browser
// router.get("/logout", (req, res, next) => {
//   req.logout((err) => {
//     if (err) return next(err);
//     req.session.destroy(() => {
//       res.redirect(`${FRONTEND_URL}/login`);
//     });
//   });
// });

// logout route untuk pendekatan jwt-based auth, jadi logout dengan menghapus token di client (frontend)
export async function logout(req: Request, res: Response) {
  // frontend harus menghapus token dari localStorage atau cookie

  // Increment tokenVersion di database untuk user yang logout, sehingga token lama menjadi tidak valid
  if (req.user) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { tokenVersion: { increment: 1 } },
    });
  }

  res.clearCookie("token"); // hapus cookie token di browser
  res.json({ message: "Logout berhasil, hapus token di client" });
}


// get all users (admin only)
export async function getAllUsersController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // cek role dari token
    if (req.user?.role !== Role.ADMIN) {
      res.status(403).json({ error: "Only admins can view all users" })
      return;
    }

    const users = await getAllUsers();
    res.json({ users });

  } catch (error) {
    next(error)
  }
}


// update role user (hanya admin)
export async function updateUserRoleController(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {
    const { userId } = req.params;
    const { role } = req.body;

    // validasi user login harus admin
    if (req.user?.role !== Role.ADMIN) {
      res.status(403).json({ error: "Only admins can change user roles" })
      return;
    }

    // validasi role yang dikirim
    if (!role || (role !== Role.USER && role !== Role.ADMIN)) {
      res.status(400).json({ error: "Role must be either USER or ADMIN" })
      return;
    }

    const updatedUser = await updateUserRole(userId as string, role as Role)

    res.json({
      message: "User role updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    next(error)
  }
}
