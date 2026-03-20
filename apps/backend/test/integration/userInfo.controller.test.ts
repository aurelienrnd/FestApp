import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

import { userInfo } from "../../src/controllers/admin/auth/userInfo.controller";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { errorHandler } from "../../src/middlewares/errorHandler";

// Mock de la fonction query pour isoler les appels base de donnees
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));
const mockQuery = vi.mocked(query);

/** Creation d'une application Express pour les tests
 * @param {string} userId userId injecte dans res.locals (simule le middleware auth)
 * @return l'application Express
 */
function createApp(userId?: string) {
  const app = express();
  app.use(express.json());
  // Simule le middleware auth qui injecte userId dans res.locals
  app.use((_req, res, next) => {
    if (userId !== undefined) res.locals.userId = userId;
    next();
  });
  app.get("/me", asyncHandler(userInfo));
  app.use(errorHandler);
  return app;
}

describe("userInfo controller (integration)", () => {
  // Reinitialise les mocks avant chaque test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with user info and mustChangePassword false when password_changed_at is set", async () => {
    // Simulation d'un utilisateur avec un mot de passe deja modifie
    mockQuery.mockResolvedValueOnce([
      {
        id: "user-1",
        email: "admin@test.fr",
        display_name: "Admin",
        role: "admin",
        password_changed_at: new Date("2026-01-01"),
      },
    ]);

    const app = createApp("user-1");
    const res = await request(app).get("/me");

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({
      id: "user-1",
      email: "admin@test.fr",
      display_name: "Admin",
      role: "admin",
    });
    expect(res.body.mustChangePassword).toBe(false);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("FROM users"),
      ["user-1"],
    );
  });

  it("should return mustChangePassword true when password_changed_at is null", async () => {
    // Simulation d'un utilisateur avec un mot de passe provisoire jamais modifie
    mockQuery.mockResolvedValueOnce([
      {
        id: "user-1",
        email: "admin@test.fr",
        display_name: "Admin",
        role: "admin",
        password_changed_at: null,
      },
    ]);

    const app = createApp("user-1");
    const res = await request(app).get("/me");

    expect(res.status).toBe(200);
    expect(res.body.mustChangePassword).toBe(true);
  });

  it("should return 401 when user is not found in database", async () => {
    // Simulation d'une reponse vide (aucun utilisateur trouve)
    mockQuery.mockResolvedValueOnce([]);

    // Creation de l'application avec un userId valide dans res.locals
    const app = createApp("user-1");
    const res = await request(app).get("/me");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_USER_NOT_FOUND);
  });

  it("should return 401 when userId is missing from locals", async () => {
    // Creation de l'application sans userId dans res.locals (simule un acces non authentifie)
    const app = createApp();
    const res = await request(app).get("/me");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_MISSING_USER);
  });

  it("should return 500 when database throws", async () => {
    // Simulation d'une erreur base de donnees
    mockQuery.mockRejectedValueOnce(new Error("db fail"));

    // Creation de l'application avec un userId valide dans res.locals
    const app = createApp("user-1");
    const res = await request(app).get("/me");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });
});
