import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { createUser } from "../../src/controllers/users/create_user.controller";
import { query } from "../../src/db";

// Mock de la fonction query
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));
const mockQuery = vi.mocked(query);

/** Creation d'une application Express pour les tests
 * @returns app
 */
function createApp() {
  const app = express();
  app.use(express.json());
  return app;
}

describe("createUser controller (integration)", () => {
  // NOTE ou c'est rapeller dans mon code?
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  // Reinitialisation des mocks avant chaque test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 201 when user is created", async () => {
    // Simulation des réponses de la base de données
    mockQuery
      .mockResolvedValueOnce([]) // l'email n'existe pas
      .mockResolvedValueOnce([]) // le display_name n'existe pas
      .mockResolvedValueOnce([
        // le user est inséré
        {
          id: "user-1",
          email: "admin@test.fr",
          display_name: "TestAdmin",
          is_active: true,
          must_change_password: true,
          created_at: new Date().toISOString(),
        },
      ]);

    const app = createApp();
    app.post("/users", createUser);

    const res = await request(app).post("/users").send({
      email: "admin@test.fr",
      password: "Test1234!",
      display_name: "TestAdmin",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Utilisateur créé");
  });

  it("should return 500 when email already exists", async () => {
    // simuler que l'email existe déjà
    mockQuery.mockResolvedValueOnce([{ id: "user-1" }]);

    const app = createApp();
    app.post("/users", createUser);

    const res = await request(app).post("/users").send({
      email: "admin@test.fr",
      password: "Test1234!",
      display_name: "TestAdmin",
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Email déjà utilisé");
  });

  it("should return 500 when display_name already exists", async () => {
    // simuler la reponse de la base de données
    mockQuery
      .mockResolvedValueOnce([]) // l'email n'existe pas
      .mockResolvedValueOnce([{ id: "user-2" }]); // le display_name existe déjà

    const app = createApp();
    app.post("/users", createUser);

    const res = await request(app).post("/users").send({
      email: "admin@test.fr",
      password: "Test1234!",
      display_name: "TestAdmin",
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Nom déjà utilisé");
  });

  it("should return 500 when database throws", async () => {
    // simuler une erreur de la base de données
    mockQuery.mockRejectedValueOnce(new Error("db fail"));

    const app = createApp();
    app.post("/users", createUser);

    const res = await request(app).post("/users").send({
      email: "admin@test.fr",
      password: "Test1234!",
      display_name: "TestAdmin",
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("db fail");
  });
});
