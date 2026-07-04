import request from "supertest";
import { describe, expect, it } from "vitest";
import { createTestApp } from "../helpers/app";

const app = createTestApp()

describe("GET /", () => {
  it("should return hello message", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Hello from backend!" })
  })
})
