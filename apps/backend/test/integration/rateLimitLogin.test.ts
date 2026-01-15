import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { rateLimitLogin } from "../../src/middlewares/rateLimitLogin";
import { validateBody } from "../../src/middlewares/validateBody";
import { createUserSchema, loginSchema } from "../../src/shemas/users.shema";

/** Creation d'une application Express pour les tests
 * @returns app
 */
function createApp() {
  const app = express();
  app.use(express.json());
  app.set("trust proxy", true);
  return app;
}

describe("rateLimitLogin middleware", () => {
  it("should limit after 5 requests", async () => {
    // creation d'une application express pour le test
    const app = createApp();
    app.post(
      "/test-create",
      validateBody(createUserSchema),
      rateLimitLogin,
      (req, res) => res.status(200).json({ success: true }),
    );

    //init d'une IP et d'un body valide
    const ip = "10.0.0.1";
    const body = {
      email: "admin@test.fr",
      password: "Test1234!",
      display_name: "TestAdmin",
    };

    // execution de 5 requetes
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post("/test-create")
        .set("X-Forwarded-For", ip)
        .send(body);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    }

    // 6eme requete doit etre rate limitee
    const res6 = await request(app)
      .post("/test-create")
      .set("X-Forwarded-For", ip)
      .send(body);
    expect(res6.status).toBe(429);
    expect(res6.body).toEqual({
      error: "Trop de tentatives, réessayer plus tard",
    });
  });
});
