import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { sessionIsOpen } from "../../src/middlewares/sessionIsOpen";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";
import { initToken, serializeCookie } from "../../src/functions";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { errorHandler } from "../../src/middlewares/errorHandler";

// mock de la fonction query, de initToken et de serializeCookie
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));
vi.mock("../../src/functions", async () => {
  const actual = await vi.importActual<typeof import("../../src/functions")>(
    "../../src/functions",
  );
  return {
    ...actual,
    initToken: vi.fn(),
    serializeCookie: vi.fn(),
  };
});
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
      (_req, res, next) => {
        res.locals.userId = "user-1";
        res.locals.sessionId = "sess-1";
        next();
      },
      asyncHandler(sessionIsOpen),
      (req, res) => res.status(200).json({ success: true }),
    );
    app.use(errorHandler);

    const res = await request(app).get("/test");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.SESSION_NOT_FOUND);
  });

  it("should return 401 when sessionId is missing in auth context", async () => {
    const app = createApp();
    app.get(
      "/test",
      (_req, res, next) => {
        res.locals.userId = "user-1";
        next();
      },
      asyncHandler(sessionIsOpen),
      (_req, res) => res.status(200).json({ success: true }),
    );
    app.use(errorHandler);

    const res = await request(app).get("/test");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_MISSING_SESSION);
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
      (_req, res, next) => {
        res.locals.userId = "user-1";
        res.locals.sessionId = "sess-1";
        next();
      },
      asyncHandler(sessionIsOpen),
      (req, res) => res.status(200).json({ success: true }),
    );
    app.use(errorHandler);

    // execution de la requete
    const res = await request(app).get("/test");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.SESSION_ALREADY_CLOSED);
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
      (_req, res, next) => {
        res.locals.userId = "user-1";
        res.locals.sessionId = "sess-1";
        next();
      },
      asyncHandler(sessionIsOpen),
      (req, res) => res.status(200).json({ success: true }),
    );
    app.use(errorHandler);

    // execution de la requete
    const res = await request(app).get("/test");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.SESSION_ALREADY_CLOSED);
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
      (_req, res, next) => {
        res.locals.userId = "user-1";
        res.locals.sessionId = "sess-1";
        next();
      },
      asyncHandler(sessionIsOpen),
      (req, res) => res.status(200).json({ success: true }),
    );
    app.use(errorHandler);

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
