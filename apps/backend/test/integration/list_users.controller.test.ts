import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

import { listUsers } from "../../src/controllers/admin/users/list_users.controller";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { errorHandler } from "../../src/middlewares/errorHandler";

vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));
const mockQuery = vi.mocked(query);

function createApp() {
  const app = express();
  app.use(express.json());
  app.get("/users", asyncHandler(listUsers));
  app.use(errorHandler);
  return app;
}

describe("listUsers controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with users list", async () => {
    mockQuery.mockResolvedValueOnce([
      {
        id: "user-1",
        email: "admin@test.fr",
        display_name: "Admin",
        is_active: true,
        role: "admin",
      },
      {
        id: "user-2",
        email: "autre@test.fr",
        display_name: "Autre",
        is_active: false,
        role: "admin",
      },
    ]);

    const app = createApp();
    const res = await request(app).get("/users");

    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(2);
    expect(res.body.users[0]).toEqual({
      id: "user-1",
      email: "admin@test.fr",
      display_name: "Admin",
      is_active: true,
      role: "admin",
    });
  });

  it("should return 500 when database throws", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db fail"));

    const app = createApp();
    const res = await request(app).get("/users");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });
});
