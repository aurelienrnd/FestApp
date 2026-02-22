import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { createUser } from "../../src/controllers/admin/users/create_user.controller";
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
  app.post("/users", asyncHandler(createUser));
  app.use(errorHandler);
  return app;
}

describe("createUser controller (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 201 when user is created", async () => {
    mockQuery
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: "user-1",
          email: "admin@test.fr",
          display_name: "TestAdmin",
          is_active: true,
          must_change_password: true,
          created_at: new Date().toISOString(),
        },
      ]);

    const app = createApp();
    const res = await request(app).post("/users").send({
      email: "admin@test.fr",
      password: "Test1234!",
      display_name: "TestAdmin",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Utilisateur créé");
  });

  it("should return 409 when email already exists", async () => {
    mockQuery.mockResolvedValueOnce([{ id: "user-1" }]);

    const app = createApp();
    const res = await request(app).post("/users").send({
      email: "admin@test.fr",
      password: "Test1234!",
      display_name: "TestAdmin",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe(ERRORS.USER_EMAIL_ALREADY_USED);
  });

  it("should return 409 when display_name already exists", async () => {
    mockQuery
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: "user-2" }]);

    const app = createApp();
    const res = await request(app).post("/users").send({
      email: "admin@test.fr",
      password: "Test1234!",
      display_name: "TestAdmin",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe(ERRORS.USER_DISPLAY_NAME_ALREADY_USED);
  });

  it("should return 500 when database throws", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db fail"));

    const app = createApp();
    const res = await request(app).post("/users").send({
      email: "admin@test.fr",
      password: "Test1234!",
      display_name: "TestAdmin",
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });
});
