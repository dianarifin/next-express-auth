import { vi } from "vitest";

// environment variables
process.env.JWT_SECRET = "test-secret-key";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.NODE_ENV = "test";

vi.mock("@/strategies/google.strategy", () => ({
  default: {
    name: "google",
    authenticate: vi.fn(),
  }
}))

vi.mock("@repo/database/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    post: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// File lokal dengan named export (bukan default):
// Tidak perlu `default` karena importnya pakai kurung kurawal.
vi.mock("@/utils/email", () => ({
  sendVerificationEmail: vi.fn(),
}));

// Di ESM, `export default` → `import X` berarti X = `default`.
// Dengan memberikan **kedua level**, mock ini kebal terhadap perubahan cara Vitest menangani CJS interop.
// Mungkin `bcrypt` = `{ hash, compare }` ✅, mungkin `bcrypt` = `{ default: { hash, compare } }` ❌ lalu `bcrypt.hash is not a function
// Mungkin `bcrypt` = `{ hash, compare }` ✅, mungkin `bcrypt` = `undefined` ❌ (karena CJS interop cari `default`)
// Aman di kedua arah** ✅✅ dengan memakai pendekatan dibawah ini:
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(() => Promise.resolve("$2a$10$mocked-hash")),
    compare: vi.fn(() => Promise.resolve(true)),
  },
  hash: vi.fn(() => Promise.resolve("$2a$10$mocked-hash")),
  compare: vi.fn(() => Promise.resolve(true)),
}));
