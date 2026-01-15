import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import authRoutes from "../../src/routes/auth.routes";
import { query } from "../../src/db";
import bcrypt from "bcrypt";

vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));

vi.mock("../../src/middlewares/auth", () => ({
  auth: (req: any, _res: any, next: any) => next(),
}));

vi.mock("../../src/middlewares/sessionIsOpen", () => ({
  sessionIsOpen: (req: any, _res: any, next: any) => next(),
}));

vi.mock("../../src/middlewares/rateLimitLogin", () => ({
  rateLimitLogin: (_req: any, _res: any, next: any) => next(),
}));

vi.mock("../../src/controllers/users/login.controller", () => ({
  login: (_req: any, res: any) => res.status(200).json({ message: "OK" }),
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
  },
}));

const mockQuery = vi.mocked(query);
const mockHash = vi.mocked(bcrypt.hash);

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/auth", authRoutes);
  return app;
}

describe("auth.routes /users (functional-ish)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a user when body is valid", async () => {
    mockHash.mockResolvedValueOnce("hashed-password");
    mockQuery
      .mockResolvedValueOnce([]) // existingEmail
      .mockResolvedValueOnce([]) // existingDisplayName
      .mockResolvedValueOnce([
        {
          id: "user-1",
          email: "admin@test.fr",
          display_name: "TestAdmin",
          is_active: true,
          must_change_password: true,
          created_at: new Date().toISOString(),
        },
      ]); // insert user

    const app = createApp();
    const res = await request(app).post("/api/v1/auth/users").send({
      email: "admin@test.fr",
      password: "Test1234!",
      display_name: "TestAdmin",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBeDefined();
    expect(mockHash).toHaveBeenCalledWith("Test1234!", 10);
    expect(mockQuery).toHaveBeenCalled();
  });

  it("should return 400 when body is invalid", async () => {
    const app = createApp();
    const res = await request(app).post("/api/v1/auth/users").send({
      email: "invalid-email",
      password: "short",
      display_name: "T",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Données invalides");
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

describe("auth.routes /login (functional-ish)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 when body is valid", async () => {
    const app = createApp();
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "admin@test.fr",
      password: "Test1234!",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("OK");
  });

  it("should return 400 when body is invalid", async () => {
    const app = createApp();
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "invalid-email",
      password: "short",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Données invalides");
  });
});
