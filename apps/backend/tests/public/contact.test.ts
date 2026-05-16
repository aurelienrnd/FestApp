import request from "supertest";
import { app } from "../helpers/testServer";
import { ERRORS } from "../../src/errors/errorMessages";

// corps valide pour le formulaire de contact
const VALID_CONTACT_BODY = {
  email: "visiteur@exemple.com",
  name: "Jean Visiteur",
  subject: "Question sur le festival",
  message: "Bonjour, j'aimerais savoir quels sont les horaires d'ouverture.",
};

// ---------------------------------------------------------------------------

describe("POST /contact/submit", () => {
  it("retourne 200 et envoie le message de contact", async () => {
    // envoyer un formulaire de contact avec des champs valides
    const res = await request(app)
      .post("/contact/submit")
      .send(VALID_CONTACT_BODY);

    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  it("retourne 400 si l'email est invalide", async () => {
    // envoyer un formulaire avec un email malformé
    const res = await request(app)
      .post("/contact/submit")
      .send({ ...VALID_CONTACT_BODY, email: "pas-un-email" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
  });

  it("retourne 400 si le nom est trop court", async () => {
    // envoyer un formulaire avec un nom inferieur a 2 caracteres
    const res = await request(app)
      .post("/contact/submit")
      .send({ ...VALID_CONTACT_BODY, name: "A" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
  });

  it("retourne 400 si le sujet est trop court", async () => {
    // envoyer un formulaire avec un sujet inferieur a 2 caracteres
    const res = await request(app)
      .post("/contact/submit")
      .send({ ...VALID_CONTACT_BODY, subject: "A" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
  });

  it("retourne 400 si le message est trop court", async () => {
    // envoyer un formulaire avec un message inferieur a 10 caracteres
    const res = await request(app)
      .post("/contact/submit")
      .send({ ...VALID_CONTACT_BODY, message: "Court" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
  });

  it("retourne 400 si des champs obligatoires sont manquants", async () => {
    // envoyer un formulaire sans le champ message
    const res = await request(app)
      .post("/contact/submit")
      .send({ email: VALID_CONTACT_BODY.email, name: VALID_CONTACT_BODY.name });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
  });
});
