import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { createUser } from "../../src/controllers/admin/users/create_user.controller";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { errorHandler } from "../../src/middlewares/errorHandler";

// Mock du module de base de donnees pour isoler les tests
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));

// Creation d'une version typee du mock pour configurer son comportement
const mockQuery = vi.mocked(query);

// Cree une instance Express configuree avec la route de creation utilisateur et le middleware global de gestion des erreurs
function createApp() {
  const app = express();
  app.use(express.json());
  app.post("/users", asyncHandler(createUser));
  app.use(errorHandler);
  return app;
}

describe("createUser controller (integration)", () => {
  // Reinitialise tous les mocks avant chaque test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 201 when user is created", async () => {
    // Simule la creation d'un utilisateur:
    mockQuery
      .mockResolvedValueOnce([]) // email libre
      .mockResolvedValueOnce([]) // display_name libre
      .mockResolvedValueOnce([
        {
          id: "user-1",
          email: "admin@test.fr",
          display_name: "John Doe",
          role: "admin",
          must_change_password: true,
          created_at: new Date().toISOString(),
        },
      ]);

    // Initialise l'application de test et envoie une requete POST
    const app = createApp();
    const res = await request(app).post("/users").send({
      email: "admin@test.fr",
      first_name: "John",
      last_name: "Doe",
      role: "admin",
    });

    // Verifie la reponse et le payload utilisateur
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Utilisateur cree");
    expect(typeof res.body.temporary_password).toBe("string");
    expect(res.body.temporary_password.length).toBeGreaterThanOrEqual(16);
    expect(res.body.user).toEqual({
      id: "user-1",
      email: "admin@test.fr",
      display_name: "John Doe",
      role: "admin",
      must_change_password: true,
      created_at: expect.any(String),
    });
  });

  it("should return 409 when email already exists", async () => {
    // Simule un conflit email
    mockQuery.mockResolvedValueOnce([{ id: "user-1" }]);

    // Initialise l'application de test et envoie une requete POST
    const app = createApp();
    const res = await request(app).post("/users").send({
      email: "admin@test.fr",
      first_name: "John",
      last_name: "Doe",
      role: "admin",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe(ERRORS.USER_EMAIL_ALREADY_USED);
  });

  it("should return 409 when display_name already exists", async () => {
    // Simule un conflit display_name
    mockQuery
      .mockResolvedValueOnce([]) // email libre
      .mockResolvedValueOnce([{ id: "user-2" }]); // display_name deja pris

    // Initialise l'application de test et envoie une requete POST
    const app = createApp();
    const res = await request(app).post("/users").send({
      email: "admin@test.fr",
      first_name: "John",
      last_name: "Doe",
      role: "admin",
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe(ERRORS.USER_DISPLAY_NAME_ALREADY_USED);
  });

  it("should return 500 when database throws", async () => {
    // Simule une erreur de base de donnees lors de l'execution de la requete
    mockQuery.mockRejectedValueOnce(new Error("db fail"));

    // Initialise l'application de test et envoie une requete POST
    const app = createApp();
    const res = await request(app).post("/users").send({
      email: "admin@test.fr",
      first_name: "John",
      last_name: "Doe",
      role: "admin",
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });
});

