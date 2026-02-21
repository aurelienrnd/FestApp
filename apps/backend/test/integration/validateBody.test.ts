import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { validateBody } from "../../src/middlewares/validateBody";
import { createUserSchema, loginSchema } from "../../src/schemas/schema";

/** Creation d'une application Express pour les tests
 * Creation d'une route de test protégée par le middleware hashPassword
 * @return req.body dans la reponse
 * @return l'aplication Express
 */
function createApp(schema: typeof createUserSchema | typeof loginSchema) {
  const app = express();
  app.use(express.json());
  app.post("/test", validateBody(schema), (req, res) => {
    return res.status(200).json(req.body);
  });
  return app;
}

describe("validateBody", () => {
  it("should allow valid createUser body and trim display_name", async () => {
    // creation de l'application avec le schema createUserSchema
    const app = createApp(createUserSchema);
    const res = await request(app).post("/test").send({
      email: "admin@test.fr",
      password: "Test1234!",
      display_name: " TestAdmin ",
    });

    expect(res.status).toBe(200);
    expect(res.body.display_name).toBe("TestAdmin");
  });

  it("should return 400 if createUser email is invalid", async () => {
    // creation de l'application avec le schema createUserSchema
    const app = createApp(createUserSchema);
    const res = await request(app).post("/test").send({
      email: "pas-un-email",
      password: "Test1234!",
      display_name: "TestAdmin",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({ error: "Données invalides" }),
    );
  });

  it("should return 400 if createUser password is too short", async () => {
    // creation de l'application avec le schema createUserSchema
    const app = createApp(createUserSchema);
    const res = await request(app).post("/test").send({
      email: "admin@test.fr",
      password: "123",
      display_name: "TestAdmin",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({ error: "Données invalides" }),
    );
  });

  it("should allow valid login body", async () => {
    // creation de l'application avec le schema createUserSchema
    const app = createApp(loginSchema);
    const res = await request(app).post("/test").send({
      email: "admin@test.fr",
      password: "Test1234!",
    });

    expect(res.status).toBe(200);
  });

  it("should return 400 if login email is invalid", async () => {
    // creation de l'application avec le schema createUserSchema
    const app = createApp(loginSchema);
    const res = await request(app).post("/test").send({
      email: "pas-un-email",
      password: "Test1234!",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({ error: "Données invalides" }),
    );
  });

  it("should return 400 if login password is too short", async () => {
    // creation de l'application avec le schema createUserSchema
    const app = createApp(loginSchema);
    const res = await request(app).post("/test").send({
      email: "admin@test.fr",
      password: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({ error: "Données invalides" }),
    );
  });
});
