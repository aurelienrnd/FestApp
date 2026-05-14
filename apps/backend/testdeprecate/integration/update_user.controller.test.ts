import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { errorHandler } from "../../src/middlewares/errorHandler";
import { validateBody } from "../../src/middlewares/validateBody";
import { createUserSchema } from "../../src/schemas/schema";
import { updateUser } from "../../src/controllers/admin/users/update_user.controller";

// Mock du module de base de donnees pour isoler les tests
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));

// Creation d'une version typee du mock pour configurer son comportement
const mockQuery = vi.mocked(query);

// Cree une instance Express configuree avec la route de modification utilisateur et le middleware global de gestion des erreurs
function createApp() {
  const app = express();
  app.use(express.json());
  app.patch(
    "/users/:id",
    validateBody(createUserSchema),
    asyncHandler(updateUser),
  );
  app.use(errorHandler);
  return app;
}

describe("updateUser controller (integration)", () => {
  // Reinitialise tous les mocks avant chaque test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 when user is updated", async () => {
    // Simule une modification reussie:
    mockQuery
      .mockResolvedValueOnce([{ id: "7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0" }]) // utilisateur cible existe
      .mockResolvedValueOnce([]) // email libre
      .mockResolvedValueOnce([]) // display_name libre
      .mockResolvedValueOnce([
        {
          id: "7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0",
          email: "updated@test.fr",
          display_name: "Updated User",
          role: "admin",

          created_at: new Date().toISOString(),
        },
      ]); // UPDATE execute

    // Initialise l'application de test et envoie une requete PATCH
    const app = createApp();
    const res = await request(app)
      .patch("/users/7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0")
      .send({
        email: "updated@test.fr",
        first_name: "Updated",
        last_name: "User",
        role: "admin",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Utilisateur modifie");
    expect(mockQuery).toHaveBeenNthCalledWith(
      4,
      `UPDATE users
     SET email = $1, display_name = $2, role = $3
     WHERE id = $4
     RETURNING id, email, display_name, role, created_at`,
      [
        "updated@test.fr",
        "Updated User",
        "admin",
        "7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0",
      ],
    );

    expect(res.body.user).toEqual({
      id: "7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0",
      email: "updated@test.fr",
      display_name: "Updated User",
      role: "admin",

      created_at: expect.any(String),
    });
  });

  it("should return 400 when user id is invalid", async () => {
    // Initialise l'application de test et envoie une requete PATCH avec un identifiant invalide
    const app = createApp();
    const res = await request(app).patch("/users/not-a-uuid").send({
      email: "updated@test.fr",
      first_name: "Updated",
      last_name: "User",
      role: "admin",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should return 400 when body is invalid", async () => {
    // Initialise l'application de test et envoie une requete PATCH avec un body invalide
    const app = createApp();
    const res = await request(app)
      .patch("/users/7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0")
      .send({
        email: "invalid-email",
        first_name: "Updated",
        last_name: "User",
        role: "admin",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should return 404 when user does not exist", async () => {
    // Simule l'absence d'utilisateur pour l'id fourni
    mockQuery.mockResolvedValueOnce([]);

    // Initialise l'application de test et envoie une requete PATCH
    const app = createApp();
    const res = await request(app)
      .patch("/users/7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0")
      .send({
        email: "updated@test.fr",
        first_name: "Updated",
        last_name: "User",
        role: "admin",
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.USER_NOT_FOUND);
  });

  it("should return 409 when email already exists", async () => {
    // Simule un conflit email
    mockQuery
      .mockResolvedValueOnce([{ id: "7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0" }]) // utilisateur cible existe
      .mockResolvedValueOnce([{ id: "another-user-id" }]); // email deja pris par un autre utilisateur

    // Initialise l'application de test et envoie une requete PATCH
    const app = createApp();
    const res = await request(app)
      .patch("/users/7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0")
      .send({
        email: "updated@test.fr",
        first_name: "Updated",
        last_name: "User",
        role: "admin",
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe(ERRORS.USER_EMAIL_ALREADY_USED);
  });

  it("should return 409 when display_name already exists", async () => {
    // Simule un conflit display_name:
    mockQuery
      .mockResolvedValueOnce([{ id: "7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0" }]) // utilisateur cible existe
      .mockResolvedValueOnce([]) // email libre
      .mockResolvedValueOnce([{ id: "another-user-id" }]); // display_name deja pris par un autre utilisateur

    // Initialise l'application de test et envoie une requete PATCH
    const app = createApp();
    const res = await request(app)
      .patch("/users/7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0")
      .send({
        email: "updated@test.fr",
        first_name: "Updated",
        last_name: "User",
        role: "admin",
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe(ERRORS.USER_DISPLAY_NAME_ALREADY_USED);
  });

  it("should return 500 when database throws", async () => {
    // Simule une erreur de base de donnees lors de l'execution de la requete
    mockQuery.mockRejectedValueOnce(new Error("db fail"));

    // Initialise l'application de test et envoie une requete PATCH
    const app = createApp();
    const res = await request(app)
      .patch("/users/7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0")
      .send({
        email: "updated@test.fr",
        first_name: "Updated",
        last_name: "User",
        role: "admin",
      });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });
});
