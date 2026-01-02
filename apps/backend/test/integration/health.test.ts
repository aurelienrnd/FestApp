import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";

describe("GET /health", () => {
  it("should return 200 + {status: ok}", async () => {
    const app = createApp();

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", message: "Backend is running" });
  });
});
