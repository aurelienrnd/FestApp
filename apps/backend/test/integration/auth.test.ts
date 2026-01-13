import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import bcrypt from "bcrypt";

import { validateBody } from "../../src/middlewares/validateBody";
import { createUserSchema, loginSchema } from "../../src/shemas/users.shema";
import { hashPassword } from "../../src/middlewares/hashPassword";
import { rateLimitLogin } from "../../src/middlewares/rateLimitLogin";

// Mock de la base de données
vi.mock("../../src/db", () => {
  return {
    query: vi.fn(), // la fonction query sera remplacée par une fonction Fake (un mock)
  };
});

// reinitialisation de tout les mocks avant chaque test
beforeEach(() => {
  vi.clearAllMocks();
});

import { query } from "../../src/db";

// routes
import authRoutes from "../../src/routes/auth.routes";

// creation d'une application express pour les tests
const app = express();
app.use(express.json());

describe("Add_user", () => {
  describe("validateBody (createUserSchema)", () => {
    // creation d'une route de test utilisant le middleware
    app.post("/test-validate", validateBody(createUserSchema), (req, res) => {
      return res.status(200).json({ success: true, data: req.body });
    });

    it("should be 200 if body is valid even with whitespace in display_name, zod shema should trim() it", async () => {
      const res = await request(app).post("/test-validate").send({
        email: "admin@test.fr",
        password: "Test1234!",
        display_name: " TestAdmin ",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe("admin@test.fr");
      expect(res.body.data.display_name).toBe("TestAdmin");
      expect(res.body.data).toHaveProperty("password"); // Le mots de passe pourait etre hashé du coup je ne controle pas sa valeur exacte mais sont existence
      expect(res.body.data.password.length).toBeGreaterThan(7); // je verifie que le mot de passe a au moins 8 caracteres comme dans le schema
    });

    it("should be 400 if email the email not corespond to the regex zod expression", async () => {
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

  describe("hashPassword", () => {
    app.post("/test-hash", hashPassword(), (req, res) => {
      return res.status(200).json({ success: true, data: req.body });
    });

    it("should be 200 and replace password with a bcrypt hash", async () => {
      const res = await request(app).post("/test-hash").send({
        password: "Test1234!",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("password"); // le mot de pass existe toujours
      expect(res.body.data.password).not.toBe("Test1234!"); //  le mot de passe a ete hashé donc il ne doit pas etre identique
    });

    it("should return 400 if password is missing", async () => {
      const res = await request(app).post("/test-hash").send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Mot de passe manquant");
    });

    it("should return 400 if password is not a string", async () => {
      const res = await request(app).post("/test-hash").send({
        password: 12345,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Mot de passe manquant");
    });
  });

  describe("POST /api/v1/auth/users", () => {
    app.use("/api/v1/auth", authRoutes);

    it("201 crée un user in bd", async () => {
      //  Simule les réponses de la base de données pour les vérifications d'unicité et l'insertion
      (query as any)
        .mockResolvedValueOnce([]) // simule qu'aucun email n'existe
        .mockResolvedValueOnce([]) //simule qu'aucun display_name n'existe
        .mockResolvedValueOnce([
          //simule l'insertion réussie de l'utilisateur
          {
            id: "uuid-123",
            email: "admin@test.fr",
            display_name: "TestAdmin",
            is_active: true,
            must_change_password: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      // creation de la requete
      const res = await request(app).post("/api/v1/auth/users").send({
        email: "admin@test.fr",
        password: "Test1234!",
        display_name: "TestAdmin",
      });

      expect(res.status).toBe(201);
    });
  });
});

describe("login", () => {
  /*describe("rateLimitLogin middleware", () => {
    app.post("/test-rate-limit", rateLimitLogin, (req, res) => {
      return res.status(200).json({ success: true });
    });

    it("should allow 5 requests and block the 6th within 10 minutes", async () => {
      // on fait 5 requetes qui doivent passer
      for (let i = 0; i < 5; i++) {
        const res = await request(app).post("/test-rate-limit");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      }

      // on fait une 6eme requete qui doit etre bloquée
      const res6 = await request(app).post("/test-rate-limit");
      expect(res6.status).toBe(429);
      expect(res6.body).toEqual({
        error: "Trop de tentatives, réessayer plus tard",
      });
    });
  });*/

  describe("validateBody (loginSchema)", () => {
    // creation d'une route de test utilisant le middleware
    app.post("/test-validate", validateBody(loginSchema), (req, res) => {
      return res.status(200).json({ success: true, data: req.body });
    });

    it("should be 200 if body is valid even with whitespace in display_name, zod shema should trim() it", async () => {
      const res = await request(app).post("/test-validate").send({
        email: "admin@test.fr",
        password: "Test1234!",
        display_name: " TestAdmin ",
        role_code: "admin",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe("admin@test.fr");
      expect(res.body.data).toHaveProperty("password"); // Le mots de passe pourait etre hashé du coup je ne controle pas sa valeur exacte mais sont existence
      expect(res.body.data.password.length).toBeGreaterThan(7); // je verifie que le mot de passe a au moins 8 caracteres comme dans le schema
    });

    it("should be 400 if the email not corespond to the regex zod expression", async () => {
      const res = await request(app).post("/test-validate").send({
        email: "pas-un-email",
        password: "Test1234!",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Données invalides");
    });

    it("should be 400 if password is too short", async () => {
      const res = await request(app).post("/test-validate").send({
        email: "admin@test.fr",
        password: "123",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Données invalides");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    app.use("/api/v1/auth", authRoutes);

    it("shoud answser 'l'utilisateur n'existe pas' if the user not existe", async () => {
      //  Simule la réponses de la base de données pour les vérifications d'unicité et l'insertion
      (query as any).mockResolvedValueOnce([]); // simule qu'aucun email n'existe

      // création de la requete
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "admin@test.fr",
        password: "Test1234!",
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("l'utilisateur n'existe pas");
    });

    it("shoud answser 'l'utilisateur n'existe pas' if the pasword is wrong", async () => {
      // Creation d'un mot de pass hasher pour le test
      const wrongHash = bcrypt.hashSync("NotThePassword", 10);

      // Moke de la BDD
      (query as any).mockResolvedValueOnce([
        {
          id: "uuid-123",
          email: "admin@test.fr",
          password_hash: wrongHash,
          display_name: "TestAdmin",
          is_active: true,
        },
      ]);

      // La requete avec le mot de pass incorecte
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "admin@test.fr",
        password: "Test1234!",
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("l'utilisateur n'existe pas");
    });

    it("shoud answser 'l'utilisateur n'existe pas' if the user is inactif", async () => {
      // Moke de la BDD
      (query as any).mockResolvedValueOnce([
        {
          id: "uuid-123",
          email: "admin@test.fr",
          password_hash: "testpasword",
          display_name: "TestAdmin",
          is_active: false,
        },
      ]);

      // La requete avec le mot de pass incorecte
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "admin@test.fr",
        password: "Test1234!",
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("l'utilisateur n'existe pas");
    });

    it("shoud answer 'Authentification réussie' and add a two cookie in the header", async () => {
      // env requis par getEnv / envToStringValue
      process.env.JWT_ACCESS_SECRET = "test-secret";
      process.env.JWT_ACCESS_EXPIRES_IN = "1h";
      process.env.SESSION_EXPIRES_IN = "1h";
      process.env.COOKIE_ACCESS_TOKEN_NAME = "access_token";
      process.env.COOKIE_ACCESS_TOKEN_SECURE = "false";
      process.env.COOKIE_ACCESS_TOKEN_SAME_SITE = "lax";

      const passwordHash = bcrypt.hashSync("Test1234!", 10);

      (query as any)
        .mockResolvedValueOnce([
          {
            id: "uuid-123",
            email: "admin@test.fr",
            password_hash: passwordHash,
            display_name: "TestAdmin",
            is_active: true,
          },
        ]) // SELECT user by email
        .mockResolvedValueOnce([]) // INSERT session
        .mockResolvedValueOnce([{ id: "sess-1" }]); // SELECT session

      const res = await request(app).post("/api/v1/auth/login").send({
        email: "admin@test.fr",
        password: "Test1234!",
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Authentification réussie");
      expect(res.headers["set-cookie"]).toHaveLength(1);
    });
  });
});
