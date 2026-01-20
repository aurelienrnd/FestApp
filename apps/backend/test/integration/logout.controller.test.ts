import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { logout } from "../../src/controllers/admin/auth/logout.controller";
import { query } from "../../src/db";

// mock de la fonction query, sessionExists et sessionRevoked
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));
vi.mock("../../src/functions", () => ({
  sessionExists: vi.fn(),
  sessionRevoked: vi.fn(),
}));
const mockQuery = vi.mocked(query);

/** Creation d'une application Express pour les tests
 * @return l'aplication Express
 */
function createApp() {
  const app = express();
  app.use(express.json());
  return app;
}

describe("logout controller (integration)", () => {
  // Reinitialiser les mocks avant chaque test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 when logout is successful", async () => {
    // simuler les reponses de la BDD
    mockQuery
      .mockResolvedValueOnce([
        {
          id: "sess-1",
          revoked_at: null,
          expires_at: new Date(Date.now() + 60_000),
        },
      ]) // sessionExists
      .mockResolvedValueOnce([{ id: "sess-1" }]); // logout update

    // creation de l'application Express avec le middleware pour les headers
    const app = createApp();
    app.use((req, _res, next) => {
      req.headers.userId = req.get("userId") as string;
      req.headers.session = req.get("session") as string;
      next();
    });
    app.post("/logout", logout);

    //Execution du test
    const res = await request(app)
      .post("/logout")
      .set("userId", "user-1")
      .set("session", "sess-1");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Deconnexion reussie");
  });

  it("should return 401 when headers are missing", async () => {
    const app = createApp();
    app.post("/logout", logout);

    const res = await request(app).post("/logout");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Missing session");
  });
});
