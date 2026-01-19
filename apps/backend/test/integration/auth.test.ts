import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { auth } from "../../src/middlewares/auth";
import { query } from "../../src/db";

// mock de la fonction query
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));
const mockQuery = vi.mocked(query);
type UserRow = { id: string; display_name: string };

/** Creation d'une application Express pour les tests
 * Creation d'une route de test protégée par le middleware d'authentification
 * @return les information enregisterts dans les headers par le middleware
 * @return l'aplication Express
 */
function createApp() {
  const app = express();
  app.use(express.json());
  app.get("/test", auth, (req, res) => {
    return res.status(200).json({
      userId: req.headers.userId,
      session: req.headers.session,
      displayName: req.headers.userdisplayName,
    });
  });
  return app;
}

describe("auth middleware", () => {
  // Reinitialisation des mocks et des variables d'environement avant chaque test
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_ACCESS_SECRET = "test-secret";
  });

  it("should return 401 if authorization header is missing", async () => {
    const app = createApp();
    const res = await request(app).get("/test");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("missing authorization");
  });

  it("should return 401 if token is invalid", async () => {
    const app = createApp();
    const res = await request(app)
      .get("/test")
      .set("Authorization", "Bearer invalidToken");

    expect(res.status).toBe(401);
    expect(res.body.error); // message généré par jsonwebtoken
  });

  it("should return 401 if user is not found", async () => {
    // creation d'un token valide
    const token = jwt.sign(
      { userId: "user-1", sessionId: "sess-1" },
      process.env.JWT_ACCESS_SECRET as string,
    );

    // simuler une réponse vide de la base de données
    mockQuery.mockResolvedValueOnce([] as UserRow[]);

    const app = createApp();
    const res = await request(app)
      .get("/test")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("User not found");
  });

  it("should set headers and continue when token is valid", async () => {
    // creation d'un token valide
    const token = jwt.sign(
      { userId: "user-1", sessionId: "sess-1" },
      process.env.JWT_ACCESS_SECRET as string,
    );

    // simuler une réponse de la base de données avec un utilisateur
    mockQuery.mockResolvedValueOnce([
      { id: "user-1", display_name: "TestUser" },
    ] as UserRow[]);

    const app = createApp();
    const res = await request(app)
      .get("/test")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe("user-1");
    expect(res.body.session).toBe("sess-1"); // l'id de session est present dans la réponse car utile au middleware suivant pour verifier la session
    expect(res.body.displayName).toBe("TestUser");
  });
});
