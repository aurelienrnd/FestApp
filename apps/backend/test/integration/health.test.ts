import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";

// Mock de la fonction query pour isoler les appels base de donnees
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));

describe("GET /health", () => {
  it("should return 200 + {status: ok}", async () => {
    const app = createApp();

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", message: "Backend is running" });
  });
});

describe("GET /debug/db", () => {
  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  it("is accessible when NODE_ENV is not production", async () => {
    const { query } = await import("../../src/db");
    vi.mocked(query).mockResolvedValueOnce([{ now: "2026-01-01T00:00:00Z" }]);

    delete process.env.NODE_ENV;
    const app = createApp();
    const res = await request(app).get("/debug/db");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ db: "ok", now: "2026-01-01T00:00:00Z" });
  });

  it("returns 404 when NODE_ENV is production", async () => {
    process.env.NODE_ENV = "production";
    const app = createApp();
    const res = await request(app).get("/debug/db");

    expect(res.status).toBe(404);
  });
});
