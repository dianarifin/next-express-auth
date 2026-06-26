// Backend entry point - Express server with auth routes
import express from "express";
import passport from "@/config/passport";
import corsMiddleware from "@/config/cors";
import authRoutes from "@/modules/auth/auth.routes";
import { errorHandler } from "@/middleware/error-handler";
import morgan from "morgan";
import { morganLogger, morganConsole } from "@/config/logger";

const app = express();
const port: number = Number(process.env.PORT) || 3001;

// Middleware - urutan penting
app.use(corsMiddleware);
app.use(express.json());
app.use(morganLogger());
app.use(morganConsole());

// app.use(cookieParser(process.env.COOKIE_SECRET || "fallback-cookie-secret"));

// express session(sebelum passport)
// saat ini tidak perlu session karena kita memakai pendekatan jwt, tapi saya tetap menaruhnya di sini sebagai contoh
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "fallback-session-secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       maxAge: 1000 * 60 * 60 * 24, // 1 hari
//       secure: process.env.NODE_ENV === "production", // hanya untuk HTTPS di production
//       httpOnly: true, // mencegah akses cookie dari JS di browser
//     },
//   }),
// );

// passport initialize
app.use(passport.initialize());

// passport session - biar passport baca/simpan session
// saat ini tidak perlu session karena kita memakai pendekatan jwt
// app.use(passport.session());

// Routes
app.use("/auth", authRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Hello from backend!" });
});

// Centralized error handler — harus dipasang paling akhir
// digunakan untuk menangani error yang dilempar dari route handler atau middleware
app.use(errorHandler);

app.listen(port, (): void => {
  console.log(`Server running on http://localhost:${port}`);
});
