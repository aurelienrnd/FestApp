import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import bcrypt from "bcrypt";
import { ERRORS } from "../../src/errors/errorMessages";
import { hashPassword } from "../../src/middlewares/hashPassword";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { errorHandler } from "../../src/middlewares/errorHandler";

/** Creation d'une application Express pour les tests
 * Creation d'une route de test protégée par le middleware hashPassword
 * @return Le mot de passe hashé dans la reponse
 * @return l'aplication Express
 */
function createApp() {
  const app = express();
  app.use(express.json());
  app.post("/test", asyncHandler(hashPassword()), (req, res) => {
    return res.status(200).json({ password: req.body.password });
  });
  app.use(errorHandler);
  return app;
}

describe("hashPassword middleware (integration)", () => {
  it("should return 400 if password is missing", async () => {
    // Creation d'une application Express pour les tests
    const app = createApp();
    const res = await request(app).post("/test").send({}); // mot de passe manquant

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: ERRORS.PASSWORD_INVALID_FORMAT });
  });

  it("should return 400 if password is not a string", async () => {
    // Creation d'une application Express pour les tests
    const app = createApp();
    const res = await request(app).post("/test").send({ password: 123 }); // le mot de passe n'est pas une chaine

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: ERRORS.PASSWORD_INVALID_FORMAT });
  });

  it("should hash the password and call next", async () => {
    // Creation d'une application Express pour les tests
    const app = createApp();
    const res = await request(app)
      .post("/test")
      .send({ password: "Test1234!" });

    expect(res.status).toBe(200);
    expect(res.body.password).not.toBe("Test1234!");
    expect(typeof res.body.password).toBe("string");
    const matches = await bcrypt.compare("Test1234!", res.body.password);
    expect(matches).toBe(true);
  });
});
