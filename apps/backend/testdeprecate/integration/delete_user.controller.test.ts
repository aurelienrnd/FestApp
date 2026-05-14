import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import { deleteUser } from "../../src/controllers/admin/users/delete_user.controller";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { errorHandler } from "../../src/middlewares/errorHandler";

// Mock du module de base de données pour isoler les tests
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));

// Création d’une version typée du mock pour configurer son comportement
const mockQuery = vi.mocked(query);

// Crée une instance Express configurée avec la route de suppression d’utilisateur et le middleware global de gestion des erreurs
function createApp() {
  const app = express();
  app.use(express.json());
  app.delete("/users/:id", asyncHandler(deleteUser));
  app.use(errorHandler);
  return app;
}

describe("deleteUser controller (integration)", () => {
  // Réinitialise tous les mocks avant chaque test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 when user is deleted", async () => {
    // Simule la suppression réussie d’un utilisateur en retournant son id
    mockQuery.mockResolvedValueOnce([
      { id: "7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0" },
    ]);

    // Initialise l’application de test et envoie une requête DELETE
    const app = createApp();
    const res = await request(app).delete(
      "/users/7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0",
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Utilisateur supprime");
    expect(mockQuery).toHaveBeenCalledWith(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      ["7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0"],
    );
  });

  it("should return 400 when user id is invalid", async () => {
    // Initialise l’application de test et envoie une requête DELETE avec un identifiant invalide
    const app = createApp();
    const res = await request(app).delete("/users/not-a-uuid");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should return 404 when user does not exist", async () => {
    // Simule une suppression sans résultat (utilisateur non trouvé)
    mockQuery.mockResolvedValueOnce([]);

    // Configure le mock pour simuler une requête DELETE
    const app = createApp();
    const res = await request(app).delete(
      "/users/7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0",
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.USER_NOT_FOUND);
  });

  it("should return 500 when database throws", async () => {
    // Simule une erreur de base de données lors de l’exécution de la requête
    mockQuery.mockRejectedValueOnce(new Error("db fail"));

    // Initialise l’application de test et envoie une requête DELETE
    const app = createApp();
    const res = await request(app).delete(
      "/users/7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0",
    );

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });
});
