import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app";

describe("GET /debug/db", () => {
  it("should return 200 + {db: ok, now: <current time>} when DB connection is successful", async () => {
    const app = createApp();

    const res = await request(app).get("/debug/db");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ db: "ok", now: expect.any(String) });
  });
});
