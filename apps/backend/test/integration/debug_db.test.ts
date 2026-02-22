import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";
import { query } from "../../src/db";

vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);

describe("GET /debug/db", () => {
  it("should return 200 + {db: ok, now: <current time>} when DB connection is successful", async () => {
    mockQuery.mockResolvedValueOnce([{ now: new Date().toISOString() }]);

    const app = createApp();
    const res = await request(app).get("/debug/db");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ db: "ok", now: expect.any(String) });
  });
});

