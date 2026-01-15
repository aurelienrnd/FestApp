import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { sessionIsOpen } from "../../src/middlewares/sessionIsOpen";
import { query } from "../../src/db";
import { initToken, serializeCookie } from "../../src/functions";

// mock de la fonction query, de initToken et de serializeCookie
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));
vi.mock("../../src/functions", () => ({
  initToken: vi.fn(),
  serializeCookie: vi.fn(),
}));
const mockQuery = vi.mocked(query);
const mockInitToken = vi.mocked(initToken);
const mockSerializeCookie = vi.mocked(serializeCookie);

/** Creation d'une application Express pour les tests
 * @return l'aplication Express
 */
function createApp() {
  const app = express();
  app.use(express.json());
  return app;
}

describe("sessionIsOpen middleware", () => {
  // reinitialisation des mocks avant chaque test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when session is missing", async () => {
    // session absente
    mockQuery.mockResolvedValueOnce([]);

    // creation de l'application
    const app = createApp();
    app.get(
      "/test",
      (req, res, next) => {
        req.headers.userId = "user-1";
        req.headers.session = "sess-1";
        next();
      },
      sessionIsOpen,
      (req, res) => res.status(200).json({ success: true }),
    );

    const res = await request(app).get("/test");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("session not found");
  });

  it("should return 401 when session is revoked", async () => {
    // simulation de la session révoquée
    mockQuery.mockResolvedValueOnce([
      {
        id: "sess-1",
        user_id: "user-1",
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        revoked_at: new Date().toISOString(),
      },
    ]);

    //creation de l'application
    const app = createApp();
    app.get(
      "/test",
      (req, res, next) => {
        req.headers.userId = "user-1";
        req.headers.session = "sess-1";
        next();
      },
      sessionIsOpen,
      (req, res) => res.status(200).json({ success: true }),
    );

    // execution de la requete
    const res = await request(app).get("/test");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("session already closed");
  });

  it("should return 401 when session is expired", async () => {
    // simulation de la session expirée
    mockQuery.mockResolvedValueOnce([
      {
        id: "sess-1",
        user_id: "user-1",
        expires_at: new Date(Date.now() - 60_000).toISOString(),
        revoked_at: null,
      },
    ]);

    //creation de l'application
    const app = createApp();
    app.get(
      "/test",
      (req, res, next) => {
        req.headers.userId = "user-1";
        req.headers.session = "sess-1";
        next();
      },
      sessionIsOpen,
      (req, res) => res.status(200).json({ success: true }),
    );

    // execution de la requete
    const res = await request(app).get("/test");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("session already closed");
  });

  it("should renew token and continue when session is valid", async () => {
    // simulation de la session valide
    mockQuery.mockResolvedValueOnce([
      {
        id: "sess-1",
        user_id: "user-1",
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        revoked_at: null,
      },
    ]);

    // simulation des fonctions initToken et serializeCookie
    mockInitToken.mockReturnValue("token-123");
    mockSerializeCookie.mockReturnValue("access_token=token-123; Path=/;");

    // creation de l'application
    const app = createApp();
    app.get(
      "/test",
      (req, res, next) => {
        req.headers.userId = "user-1";
        req.headers.session = "sess-1";
        next();
      },
      sessionIsOpen,
      (req, res) => res.status(200).json({ success: true }),
    );

    // execution de la requete
    const res = await request(app).get("/test");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(mockInitToken).toHaveBeenCalledWith(
      "user-1",
      "JWT_ACCESS_SECRET",
      "JWT_ACCESS_EXPIRES_IN",
      "sess-1",
    );
    expect(mockSerializeCookie).toHaveBeenCalledWith(
      "COOKIE_ACCESS_TOKEN_NAME",
      "COOKIE_ACCESS_TOKEN_SECURE",
      "COOKIE_ACCESS_TOKEN_SAME_SITE",
      "token-123",
      "JWT_ACCESS_EXPIRES_IN",
    );
  });
});
