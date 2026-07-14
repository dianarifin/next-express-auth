import { Handler } from "express";
import morgan from "morgan";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Morgan logger middleware — menulis log request/response.
 * - Development: output "dev" (ringkas, warna-warni) ke console
 * - Production:   output "combined" (lengkap) ke file + console
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const logsDir = path.join(__dirname, "../../logs");

export function ensureLogsDir() {
  fs.mkdirSync(logsDir, { recursive: true });
}

export function morganLogger(): Handler {
  ensureLogsDir();

  const accessLogStream = fs.createWriteStream(
    path.join(logsDir, "access.log"),
    { flags: "a" },
  );

  if (process.env.NODE_ENV === "production") {
    return morgan("combined", { stream: accessLogStream });
  }

  // dev: tetap tulis ke file + console
  return morgan("dev");
}

/** Morgan middleware untuk console di production (dipasang terpisah) */
export function morganConsole(): Handler {
  if (process.env.NODE_ENV === "production") {
    return morgan("combined");
  }

  // ini artinya melompatkan log ke console di development, karena sudah ada morgan("dev") di morganLogger. Jadi tidak perlu log ke console dua kali.
  // ia hanya mereturn middleware yang memanggil next() tanpa melakukan apa-apa.
  return (_req, _res, next) => next();
}
