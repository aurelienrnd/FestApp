import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import bcrypt from "bcrypt";

import { changePassword } from "../../src/controllers/admin/auth/change_password.controller";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { errorHandler } from "../../src/middlewares/errorHandler";

// Mock de la fonction query pour isoler les appels base de donnees
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));

// Mock de bcrypt pour isoler la comparaison de mot de passe
vi.mock("bcrypt", () => ({
  default: { compare: vi.fn() },
}));

const mockQuery = vi.mocked(query);
const mockBcryptCompare = vi.mocked(bcrypt.compare);

/** Creation d'une application Express pour les tests
 * @param {string} userId userId injecte dans res.locals (simule le middleware auth)
 * @return l'application Express
 */
function createApp(userId?: string) {
  const app = express();
  app.use(express.json());
  app.use((_req, res, next) => {
    if (userId !== undefined) res.locals.userId = userId;
    next();
  });
  app.patch("/password", asyncHandler(changePassword));
  app.use(errorHandler);
  return app;
}

describe("changePassword controller (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 when password is changed successfully", async () => {
    mockQuery
      .mockResolvedValueOnce([
        {
          id: "user-1",
          email: "admin@test.fr",
          password_hash: "$2b$10$hashedpwd",
          display_name: "Admin",
        },
      ]) // SELECT user
      .mockResolvedValueOnce([]); // UPDATE

    mockBcryptCompare.mockResolvedValueOnce(true as never);

    const app = createApp("user-1");
    const res = await request(app)
      .patch("/password")
      .send({ password: "OldPass1!", newPassword: "$2b$10$newhashedpwd" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Mot de passe modifie");
    expect(mockBcryptCompare).toHaveBeenCalledWith(
      "OldPass1!",
      "$2b$10$hashedpwd",
    );
  });

  it("should return 401 when the current password is wrong", async () => {
    mockQuery.mockResolvedValueOnce([
      {
        id: "user-1",
        email: "admin@test.fr",
        password_hash: "$2b$10$hashedpwd",
        display_name: "Admin",
      },
    ]);

    mockBcryptCompare.mockResolvedValueOnce(false as never);

    const app = createApp("user-1");
    const res = await request(app)
      .patch("/password")
      .send({ password: "WrongPass1!", newPassword: "$2b$10$newhashedpwd" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_WRONG_PASSWORD);
  });

  it("should return 404 when user is not found in database", async () => {
    mockQuery.mockResolvedValueOnce([]);

    const app = createApp("user-1");
    const res = await request(app)
      .patch("/password")
      .send({ password: "OldPass1!", newPassword: "$2b$10$newhashedpwd" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.AUTH_USER_NOT_FOUND);
  });

  it("should return 401 when userId is missing from locals", async () => {
    const app = createApp();
    const res = await request(app)
      .patch("/password")
      .send({ password: "OldPass1!", newPassword: "$2b$10$newhashedpwd" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_MISSING_USER);
  });

  it("should return 500 when the first database query throws", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db fail"));

    const app = createApp("user-1");
    const res = await request(app)
      .patch("/password")
      .send({ password: "OldPass1!", newPassword: "$2b$10$newhashedpwd" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });

  it("should return 500 when the update query throws", async () => {
    mockQuery
      .mockResolvedValueOnce([
        {
          id: "user-1",
          email: "admin@test.fr",
          password_hash: "$2b$10$hashedpwd",
          display_name: "Admin",
        },
      ])
      .mockRejectedValueOnce(new Error("db fail"));

    mockBcryptCompare.mockResolvedValueOnce(true as never);

    const app = createApp("user-1");
    const res = await request(app)
      .patch("/password")
      .send({ password: "OldPass1!", newPassword: "$2b$10$newhashedpwd" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });
});
