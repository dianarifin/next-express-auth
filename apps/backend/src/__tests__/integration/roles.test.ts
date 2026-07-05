import { prisma } from "@repo/database/lib/prisma";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestApp } from "../helpers/app";
import { authHeader, generateTestToken } from "../helpers/auth";

const app = createTestApp();

const adminToken = generateTestToken({ role: "ADMIN" });
const userToken = generateTestToken({ role: "USER" });

const mockUsersList = [
  {
    id: "user-1",
    email: "user1@example.com",
    name: "User One",
    avatarUrl: null,
    role: "USER" as const,
    provider: "local",
    emailVerified: true,
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "user-2",
    email: "admin@example.com",
    name: "Admin User",
    avatarUrl: null,
    role: "ADMIN" as const,
    provider: "google",
    emailVerified: true,
    createdAt: new Date("2025-01-02"),
  },
]

describe("GET /auth/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })

  it("should return all users when called by admin", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      tokenVersion: 0
    } as any);
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsersList as any);

    const res = await request(app)
      .get("/auth/users")
      .set(authHeader(adminToken))

    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(2);
    expect(res.body.users[0]).toMatchObject({
      id: "user-1",
      email: "user1@example.com",
      role: "USER",
    });
    expect(res.body.users[1]).toMatchObject({
      id: "user-2",
      email: "admin@example.com",
      role: "ADMIN",
    });
  })

  it("should return 403 when called by non-admin user", async () => {
     vi.mocked(prisma.user.findUnique).mockResolvedValue({
       tokenVersion: 0,
     } as any);

     const res = await request(app)
       .get("/auth/users")
       .set(authHeader(userToken));

     expect(res.status).toBe(403);
     expect(res.body.error).toBe("Only admins can view all users");
   });

   it("should return 401 without token", async () => {
     const res = await request(app).get("/auth/users");

     expect(res.status).toBe(401);
     expect(res.body.error).toBe("Unauthorized");
   });

   it("should return 401 with revoked token", async () => {
     vi.mocked(prisma.user.findUnique).mockResolvedValue({
       tokenVersion: 99,
     } as any);

     const res = await request(app)
       .get("/auth/users")
       .set(authHeader(adminToken));

     expect(res.status).toBe(401);
     expect(res.body.error).toBe("Token has been revoked");
   });

   it("should return empty array when no users exist", async () => {
     vi.mocked(prisma.user.findUnique).mockResolvedValue({
       tokenVersion: 0,
     } as any);
     vi.mocked(prisma.user.findMany).mockResolvedValue([]);

     const res = await request(app)
       .get("/auth/users")
       .set(authHeader(adminToken));

     expect(res.status).toBe(200);
     expect(res.body.users).toEqual([]);
   });
})

// patch /auth/users/:userId/role
describe("PATCH /auth/users/:userId/role", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })

  it("should update user role from USER to ADMIN", async () => {
    // 1st findUnique -> authenticateJwt (tokenVersion check)
    // 2nd findUnique -> udpateUserRole (user exists check)
    vi.mocked(prisma.user.findUnique)
      .mockResolvedValueOnce({ tokenVersion: 0 } as any)
      .mockResolvedValueOnce(mockUsersList[0] as any)

    vi.mocked(prisma.user.update).mockResolvedValue({
      ...mockUsersList[0],
      role: "ADMIN",
    } as any)

    const res = await request(app)
      .patch("/auth/users/user-1/role")
      .set(authHeader(adminToken))
      .send({ role: "ADMIN" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User role updated successfully");
    expect(res.body.user.role).toBe("ADMIN");
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { role: "ADMIN" },
      select: expect.objectContaining({
        id: true,
        role: true,
      })
    });
    });

    it("should update user role from ADMIN to USER", async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ tokenVersion: 0 } as any)
        .mockResolvedValueOnce(mockUsersList[1] as any)

      vi.mocked(prisma.user.update).mockResolvedValue({
        ...mockUsersList[1],
        role: "USER",
      } as any);

      const res = await request(app)
        .patch("/auth/users/user-2/role")
        .set(authHeader(adminToken))
        .send({ role: "USER" })

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe("USER");
    });

    it("should return 403 when called by non-admin user", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        tokenVersion: 0
      } as any);

      const res = await request(app)
        .patch("/auth/users/user-1/role")
        .set(authHeader(userToken))
        .send({ role: "ADMIN" })

      expect(res.status).toBe(403)
      expect(res.body.error).toBe("Only admins can change user roles");
    });

    it("should return 401 without token", async () => {
      const res = await request(app)
        .patch("/auth/users/user-1/role")
        .send({ role: "ADMIN" })

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Unauthorized");
    });

    it("should return 400 when role is missing from body", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        tokenVersion: 0
      } as any)

      const res = await request(app)
        .patch("/auth/users/user-1/role")
        .set(authHeader(adminToken))
        .send({})

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Role must be either USER or ADMIN");
    });

    it("should return 404 when target user does not exist", async () => {
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ tokenVersion: 0 } as any)
        .mockResolvedValueOnce(null); // user not found

      const res = await request(app)
        .patch("/auth/users/nonexistent/role")
        .set(authHeader(adminToken))
        .send({ role: "ADMIN" });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("User not found");
    });

    it("should return 401 with revoked token", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        tokenVersion: 99,
      } as any);

      const res = await request(app)
        .patch("/auth/users/user-1/role")
        .set(authHeader(adminToken))
        .send({ role: "ADMIN" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Token has been revoked");
    });
});
