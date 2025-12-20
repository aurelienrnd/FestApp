import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";

import { validateBody } from "../../src/middlewares/validateBody";
import { createUserSchema } from "../../src/shemas/users.shema";

describe("Auth middlewares", () => {
  // creation d'une application express pour les tests
  const app = express();
  app.use(express.json());

  describe("validateBody (createUserSchema)", () => {
    // creation d'une route de test utilisant le middleware
    app.post("/test-validate", validateBody(createUserSchema), (req, res) => {
      return res.status(200).json({ success: true, data: req.body });
    });

    it("should be 200 if body is valid", async () => {
      const res = await request(app).post("/test-validate").send({
        email: "admin@test.fr",
        password: "Test1234!",
        display_name: "TestAdmin",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe("admin@test.fr");
      expect(res.body.data.display_name).toBe("TestAdmin");
      expect(res.body.data).toHaveProperty("password"); // Le mots de passe pourait etre hashé du coup je ne controle pas sa valeur exacte mais sont existence
      expect(res.body.data.password.length).toBeGreaterThan(7); // je verifie que le mot de passe a au moins 8 caracteres comme dans le schema
    });

    it("should be 400 if email is invalid", async () => {
      const res = await request(app).post("/test-validate").send({
        email: "pas-un-email",
        password: "Test1234!",
        display_name: "TestAdmin",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Données invalides");
    });

    it("should be 400 if password is too short", async () => {
      const res = await request(app).post("/test-validate").send({
        email: "admin@test.fr",
        password: "123",
        display_name: "TestAdmin",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Données invalides");
    });
  });
});
