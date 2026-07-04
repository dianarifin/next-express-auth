import { prisma } from "@repo/database/lib/prisma";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestApp } from "../helpers/app";
import { authHeader, generateTestToken } from "../helpers/auth";

const app = createTestApp();

// mock data
const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  password: "$2a$10$mocked-hash",
  avatarUrl: null,
  role: "USER" as const,
  provider: "local",
  tokenVersion: 0,
  emailVerified: false,
  googleId: null,
  verificationToken: null,
  verificationTokenExpiresAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};


const mockUserPublic = {
  id: mockUser.id,
  email: mockUser.email,
  name: mockUser.name,
  avatarUrl: mockUser.avatarUrl,
  role: mockUser.role,
};

// POST /auth/register
describe("POST /auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  });

  it("should register a new user successfully", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser);
    vi.mocked(prisma.user.update).mockResolvedValue({
      ...mockUser,
      verificationToken: "mock-token",
    });

    const res = await request(app)
      .post("/auth/register")
      .send({ name: "Test user", email: "test@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toMatchObject(mockUserPublic);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "Test user" })

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Nama, email, and password are required")
  });

  it("should return 400 if password is too short", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "Test user", email: "test@example.com", password: "12345" })

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Password must be at least 6 characters")
  });
})

// POST /auth/login
describe("POST /auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should login successfully with valid credentials", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com", password: "password123" })

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toMatchObject(mockUserPublic);
  });

  it("should return 400 if email/password  missing", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com" })

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email and password are required");
  });

  it("should return error for invalid email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .post("/auth/login")
      .send({ email: "wrong@example.com", password: "password123"})

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Invalid email or password");
  })
})


// GET /auth/me
describe("GET /auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return current user with valid token", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ tokenVersion: 0 } as any);

    const token = generateTestToken();
    const res = await request(app).get("/auth/me").set(authHeader(token));

    expect(res.status).toBe(200);
       expect(res.body.user).toMatchObject({
         id: "test-user-id",
         email: "test@example.com",
       })
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  })

  it("should return 401 with revoked token", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ tokenVersion: 99 } as any);

    const token = generateTestToken({ tokenVersion: 0 });
    const res = await request(app).get("/auth/me").set(authHeader(token));

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Token has been revoked")

  })

  it("should return 401 with invalid token", async () => {
    const res = await request(app).get("/auth/me").set(authHeader("invalid-token"));

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid token");
  })
})

// GET /auth/logout
describe("GET /auth/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should logout successfully and increment tokenVersion", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ tokenVersion: 0 } as any);
    vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser, tokenVersion: 1 })

    const token = generateTestToken();
    const res = await request(app).get("/auth/logout").set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Logout berhasil");
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "test-user-id" },
      data: { tokenVersion: { increment: 1 } }
    });
  });
});

// GET /auth/resend-verification
describe("GET /auth/resend-verification", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should resend verification email", async () => {
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce({ tokenVersion: 0 } as any)
      .mockResolvedValueOnce(mockUser);
    vi.mocked(prisma.user.update).mockResolvedValue({
      ...mockUser,
      verificationToken: "new-token",
    });

    const token = generateTestToken();
    const res = await request(app)
      .get("/auth/resend-verification")
      .set(authHeader(token))

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("dikirim ulang");
  })
})
