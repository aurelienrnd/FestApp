import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { forgotPassword } from "../../src/controllers/admin/auth/forgot_password.controller";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { validateBody } from "../../src/middlewares/validateBody";
import { errorHandler } from "../../src/middlewares/errorHandler";
import { forgotPasswordSchema } from "../../src/schemas/schema";

// Mock du module de base de donnees pour isoler les tests
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));

// Mock du service mailer pour eviter les appels SMTP en test
vi.mock("../../src/services/mailer", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

// Creation d'une version typee du mock pour configurer son comportement
const mockQuery = vi.mocked(query);

// Cree une instance Express configuree avec la route de reinitialisation de mot de passe et le middleware global de gestion des erreurs
function createApp() {
  const app = express();
  app.use(express.json());
  app.post(
    "/auth/forgot-password",
    validateBody(forgotPasswordSchema),
    asyncHandler(forgotPassword),
  );
  app.use(errorHandler);
  return app;
}

describe("forgotPassword controller (integration)", () => {
  // Reinitialise tous les mocks avant chaque test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 when email exists and password is reset", async () => {
    // Simule la recuperation de l'utilisateur puis la mise a jour du mot de passe
    mockQuery
      .mockResolvedValueOnce([
        { id: "user-1", email: "admin@test.fr", display_name: "Admin" },
      ]) // SELECT user
      .mockResolvedValueOnce([]); // UPDATE password

    // Initialise l'application de test et envoie une requete POST
    const app = createApp();
    const res = await request(app)
      .post("/auth/forgot-password")
      .send({ email: "admin@test.fr" });

    // Verifie la reponse et que les deux requetes SQL ont ete executees
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Nouveau mot de passe envoye par email");
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it("should return 404 when email is not found", async () => {
    // Simule l'absence d'utilisateur en base pour l'email fourni
    mockQuery.mockResolvedValueOnce([]);

    // Initialise l'application de test et envoie une requete POST
    const app = createApp();
    const res = await request(app)
      .post("/auth/forgot-password")
      .send({ email: "inconnu@test.fr" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.AUTH_EMAIL_NOT_FOUND);
  });

  it("should return 400 when body is invalid", async () => {
    // Initialise l'application de test et envoie une requete avec un email malformé
    const app = createApp();
    const res = await request(app)
      .post("/auth/forgot-password")
      .send({ email: "pas-un-email" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
  });

  it("should return 500 when database throws", async () => {
    // Simule une erreur de base de donnees lors de l'execution de la requete
    mockQuery.mockRejectedValueOnce(new Error("db fail"));

    // Initialise l'application de test et envoie une requete POST
    const app = createApp();
    const res = await request(app)
      .post("/auth/forgot-password")
      .send({ email: "admin@test.fr" });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });
});
