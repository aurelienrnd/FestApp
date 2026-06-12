import jwt from "jsonwebtoken";
import { auth, optionalAuth } from "../../src/middlewares/auth";
import { AppError } from "../../src/errors/AppError";
import { ERRORS } from "../../src/errors/errorMessages";
import type { Request, Response, NextFunction } from "express";

// mock de la couche db pour ne pas toucher la base de donnees
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));

import { query } from "../../src/db";

// recupere le mock de query sous forme typee pour le controler dans chaque test
const queryMock = vi.mocked(query);

// valeurs correspondant aux variables d'env injectees dans le conteneur de test
const COOKIE_NAME = "vindhellfest_access_token";
const JWT_SECRET = "un-super-secret-a-changer";

// construit un header cookie contenant le token
function makeCookie(token: string) {
  return `${COOKIE_NAME}=${token}`;
}

// signe un token JWT valide avec les ids de test
function makeValidToken(
  userId = "user-uuid",
  sessionId = "session-uuid",
): string {
  return jwt.sign({ userId, sessionId }, JWT_SECRET, { expiresIn: "1h" });
}

// ---------------------------------------------------------------------------

describe("auth", () => {
  it("throw AUTH_MISSING_COOKIE si aucun cookie n'est present", async () => {
    // simuler une requete sans header cookie
    const req = { headers: {} } as Request;
    const res = { locals: {} } as Response;
    const next = vi.fn() as NextFunction;

    await expect(auth(req, res, next)).rejects.toThrow(
      new AppError(ERRORS.AUTH_MISSING_COOKIE, 401),
    );
  });

  it("throw AUTH_INVALID_ACCESS_TOKEN si le token est invalide", async () => {
    // simuler une requete avec un token mal forme
    const req = {
      headers: { cookie: makeCookie("token-invalide") },
    } as Request;
    const res = { locals: {} } as Response;
    const next = vi.fn() as NextFunction;

    await expect(auth(req, res, next)).rejects.toThrow(
      new AppError(ERRORS.AUTH_INVALID_ACCESS_TOKEN, 401),
    );
  });

  it("throw AUTH_USER_NOT_FOUND si le user n'existe pas en base", async () => {
    // simuler une requete avec un token valide mais aucun user en base
    const token = makeValidToken();
    const req = {
      headers: { cookie: makeCookie(token) },
    } as Request;
    const res = { locals: {} } as Response;
    const next = vi.fn() as NextFunction;

    // la requete SQL ne retourne aucun utilisateur
    queryMock.mockResolvedValueOnce([]);

    await expect(auth(req, res, next)).rejects.toThrow(
      new AppError(ERRORS.AUTH_USER_NOT_FOUND, 401),
    );
  });

  it("peuple res.locals et appelle next() si le token est valide et le user existe", async () => {
    // simuler une requete avec un token valide et un user existant en base
    const token = makeValidToken("user-uuid", "session-uuid");
    const req = {
      headers: { cookie: makeCookie(token) },
    } as Request;
    const res = { locals: {} } as unknown as Response;
    const next = vi.fn() as NextFunction;

    // la requete SQL retourne un utilisateur existant
    queryMock.mockResolvedValueOnce([
      { id: "user-uuid", display_name: "Jean Dupont", role: "admin" },
    ]);

    await auth(req, res, next);

    // res.locals doit etre peuple avec les infos de l'utilisateur
    expect(res.locals.userId).toBe("user-uuid");
    expect(res.locals.userRole).toBe("admin");
    expect(res.locals.userDisplayName).toBe("Jean Dupont");
    expect(res.locals.sessionId).toBe("session-uuid");
    expect(next).toHaveBeenCalledWith();
  });
});

// ---------------------------------------------------------------------------

describe("optionalAuth", () => {
  it("appelle next() sans peupler res.locals si aucun cookie n'est present", async () => {
    // simuler une requete sans header cookie
    const req = { headers: {} } as Request;
    const res = { locals: {} } as unknown as Response;
    const next = vi.fn() as NextFunction;

    // optionalAuth doit simplement appeler next() sans erreur et sans toucher a res.locals
    await optionalAuth(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.locals.userId).toBeUndefined();
  });

  it("appelle next() sans peupler res.locals si le token est invalide", async () => {
    // simuler une requete avec un token mal forme
    const req = {
      headers: { cookie: makeCookie("token-invalide") },
    } as Request;
    const res = { locals: {} } as unknown as Response;
    const next = vi.fn() as NextFunction;

    // optionalAuth doit simplement appeler next() sans erreur et sans toucher a res.locals
    await optionalAuth(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.locals.userId).toBeUndefined();
  });

  it("peuple res.locals et appelle next() si le token est valide et le user existe", async () => {
    // simuler une requete avec un token valide et un user existant en base
    const token = makeValidToken("user-uuid", "session-uuid");
    const req = {
      headers: { cookie: makeCookie(token) },
    } as Request;
    const res = { locals: {} } as unknown as Response;
    const next = vi.fn() as NextFunction;

    // premiere requete : retourne l'utilisateur, deuxieme : retourne la session active
    queryMock.mockResolvedValueOnce([
      { id: "user-uuid", display_name: "Marie Martin", role: "news" },
    ]);
    queryMock.mockResolvedValueOnce([{ id: "session-uuid", revoked_at: null }]);

    // optionalAuth doit peupler res.locals et appeler next() sans erreur
    await optionalAuth(req, res, next);

    // res.locals doit etre peuple avec les infos de l'utilisateur
    expect(res.locals.userId).toBe("user-uuid");
    expect(res.locals.userRole).toBe("news");
    expect(res.locals.userDisplayName).toBe("Marie Martin");
    expect(next).toHaveBeenCalledWith();
  });
});
