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

vi.mock("@/utils/email", () => ({
  sendVerificationEmail: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(() => Promise.resolve("$2a$10$mocked-hash")),
    compare: vi.fn(() => Promise.resolve(true)),
  },
  hash: vi.fn(() => Promise.resolve("$2a$10$mocked-hash")),
  compare: vi.fn(() => Promise.resolve(true)),
}));
