import rateLimit from "express-rate-limit";

/**
 * Rate limiter untuk auth routes (login, register)
 * Maksimal 10 percobaan per IP dalam 1 menit
 * Setelah melebihi batas, IP akan diblokir selama 1 menit
 */

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 10, // mak 10 request
  standardHeaders: true, // kirim header rateLimit
  legacyHeaders: false, // Nonaktifkan header x-rate-limit
  message: {
    error: "Terlalu banyak percobaan. Silakan coba lagi setelah 1 menit"
  },
  skipSuccessfulRequests: false, // Hitung semua request (termasuk yang sukes) - default sudah false
})

/**
 * Rate limiter umum — bisa dipakai untuk route non-auth yang sensitif
 * seperti forgot-password, resend-verification, dll.
 * Maksimal 5 request per 15 menit.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Terlalu banyak permintaan. Silakan coba lagi nanti.",
  },
});

/**
 * Rate limiter strict — untuk endpoint yang sangat sensitif
 * seperti resend email verification.
 * Maksimal 3 request per 10 menit.
 */
export const strictLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 menit
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Terlalu banyak permintaan. Silakan coba lagi dalam 10 menit.",
  },
});
