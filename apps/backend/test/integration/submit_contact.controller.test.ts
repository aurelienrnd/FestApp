import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { submitContact } from "../../src/controllers/contact/submit_contact.controller";
import { ERRORS } from "../../src/errors/errorMessages";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { validateBody } from "../../src/middlewares/validateBody";
import { errorHandler } from "../../src/middlewares/errorHandler";
import { contactSchema } from "../../src/schemas/schema";

// Mock du service mailer pour eviter les appels SMTP en test
vi.mock("../../src/services/mailer", () => ({
  sendContactEmail: vi.fn().mockResolvedValue(undefined),
}));

// Cree une instance Express configuree avec la route de contact et le middleware global de gestion des erreurs
function createApp() {
  const app = express();
  app.use(express.json());
  app.post(
    "/contact/submit",
    validateBody(contactSchema),
    asyncHandler(submitContact),
  );
  app.use(errorHandler);
  return app;
}

describe("submitContact controller (integration)", () => {
  // Reinitialise tous les mocks avant chaque test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 when contact form is submitted successfully", async () => {
    // Initialise l'application de test et envoie une requete POST valide
    const app = createApp();
    const res = await request(app).post("/contact/submit").send({
      email: "visiteur@example.fr",
      name: "Jean Dupont",
      subject: "Question sur le festival",
      message: "Bonjour, je souhaitais savoir plus d'informations.",
    });

    // Verifie la reponse de succes
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Message envoye");
  });

  it("should return 400 when body is invalid", async () => {
    // Initialise l'application de test et envoie une requete avec un champ manquant
    const app = createApp();
    const res = await request(app).post("/contact/submit").send({
      email: "visiteur@example.fr",
      name: "Jean Dupont",
      // subject manquant
      message: "Bonjour",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
  });

  it("should return 500 when mailer throws", async () => {
    // Simule une erreur SMTP lors de l'envoi du mail
    const { sendContactEmail } = await import("../../src/services/mailer");
    vi.mocked(sendContactEmail).mockRejectedValueOnce(new Error("SMTP fail"));

    // Initialise l'application de test et envoie une requete POST valide
    const app = createApp();
    const res = await request(app).post("/contact/submit").send({
      email: "visiteur@example.fr",
      name: "Jean Dupont",
      subject: "Question sur le festival",
      message: "Bonjour, je souhaitais savoir plus d'informations.",
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });
});
