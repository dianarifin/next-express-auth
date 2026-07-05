import { prisma } from "@repo/database/lib/prisma";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPost } from "../fixtures/post.fixture";
import { createTestApp } from "../helpers/app";
import { authHeader, generateTestToken } from "../helpers/auth";

const app = createTestApp();

const token = generateTestToken();

// POST /posts
describe("POST /posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ tokenVersion: 0 } as any)
  })

  it("should create a post", async () => {
    vi.mocked(prisma.post.create).mockResolvedValue(mockPost);

    const res = await request(app)
      .post("/posts")
      .set(authHeader(token))
      .send({ title: "Test Post", content: "Test content" });

    expect(res.status).toBe(201);
    expect(res.body.post).toMatchObject({
      id: "post-1",
      title: "Test Post"
    });
  });

  it("should return 400 if title is empty", async () => {
    const res = await request(app)
      .post("/posts")
      .set(authHeader(token))
      .send({ title: "", content: "Test" })

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Title is required");
  });
});

// GET /posts
describe("GET /posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ tokenVersion: 0 } as any);
  });

  it("should return a post by id", async () => {
    vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPost);

    const res = await request(app).get("/posts/post-1").set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.post.id).toBe("post-1");
    expect(res.body.post.author).toBeDefined();
  });

  it("should return 404 if post not found", async () => {
    vi.mocked(prisma.post.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .get("/posts/nonexistent")
      .set(authHeader(token));

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Post not found")
  });
});

// PUT /posts/:id
describe("PUT /posts/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ tokenVersion: 0 } as any);
  });

  it("should update own post", async () => {
    vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPost);
    vi.mocked(prisma.post.update).mockResolvedValue({
      ...mockPost,
      title: "Updated Title"
    });

    const res = await request(app)
      .put("/posts/post-1")
      .set(authHeader(token))
      .send({ title: "Updated Title" })

    expect(res.status).toBe(200);
    expect(res.body.post.title).toBe("Updated Title");
  });

  it("should return 403 if updating someone else's post", async () => {
    const otherPost = { ...mockPost, authorId: "other-user-id" };
    vi.mocked(prisma.post.findUnique).mockResolvedValue(otherPost);

    const res = await request(app)
      .put("/posts/other-post")
      .set(authHeader(token))
      .send({ title: "Hacked!" });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("not authorized");
  });
});

// DELETE /posts/:id
describe("DELETE /posts/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ tokenVersion: 0 } as any)
  });

  it("should delete own post", async () => {
    vi.mocked(prisma.post.findUnique).mockResolvedValue(mockPost);
    vi.mocked(prisma.post.delete).mockResolvedValue(mockPost);

    const res = await request(app)
      .delete("/posts/post-1")
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Post deleted successfully");
  });

  it("should return 403 if deleting someone else's post", async () => {
    const otherPost = { ...mockPost, authorId: "other-user-id" };
    vi.mocked(prisma.post.findUnique).mockResolvedValue(otherPost);

    const res = await request(app)
      .delete("/posts/other-post")
      .set(authHeader(token));

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("not authorized");
  });
});
