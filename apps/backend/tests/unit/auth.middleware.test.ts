import { auth, optionalAuth } from "../../src/middlewares/auth";
import { AppError } from "../../src/errors/AppError";
import { ERRORS } from "../../src/errors/errorMessages";
import type { Request, Response, NextFunction } from "express";

// mock de l'instance Better Auth pour ne pas toucher la base de donnees ni exiger les env vars BETTER_AUTH_*
vi.mock("../../src/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

import { auth as betterAuth } from "../../src/lib/auth";

// recupere le mock de getSession sous forme typee pour le controler dans chaque test
const getSessionMock = vi.mocked(betterAuth.api.getSession);

// construit une requete Express minimale avec un cookie de session
function makeRequest(cookie = "vindhellfest.session_token=un-token"): Request {
  return { headers: { cookie } } as Request;
}

// simule le resultat renvoye par betterAuth.api.getSession() pour une session valide
function makeSessionResult(
  userId = "user-uuid",
  role = "admin",
  name = "Jean Dupont",
  sessionId = "session-uuid",
) {
  return {
    user: { id: userId, role, name },
    session: { id: sessionId },
  };
}

// ---------------------------------------------------------------------------

describe("auth", () => {
  it("throw AUTH_MISSING_SESSION si getSession() renvoie null", async () => {
    // simuler une requete sans session valide (cookie absent, invalide ou expire)
    const req = makeRequest();
    const res = { locals: {} } as Response;
    const next = vi.fn() as NextFunction;

    getSessionMock.mockResolvedValueOnce(null);

    await expect(auth(req, res, next)).rejects.toThrow(
      new AppError(ERRORS.AUTH_MISSING_SESSION, 401),
    );
  });

  it("peuple res.locals et appelle next() si une session valide existe", async () => {
    // simuler une requete avec une session valide retournee par Better Auth
    const req = makeRequest();
    const res = { locals: {} } as unknown as Response;
    const next = vi.fn() as NextFunction;

    getSessionMock.mockResolvedValueOnce(
      makeSessionResult("user-uuid", "admin", "Jean Dupont", "session-uuid"),
    );

    await auth(req, res, next);

    // res.locals doit etre peuple avec les infos de l'utilisateur et de la session
    expect(res.locals.userId).toBe("user-uuid");
    expect(res.locals.userRole).toBe("admin");
    expect(res.locals.userDisplayName).toBe("Jean Dupont");
    expect(res.locals.sessionId).toBe("session-uuid");
    expect(next).toHaveBeenCalledWith();
  });
});

// ---------------------------------------------------------------------------

describe("optionalAuth", () => {
  it("appelle next() sans peupler res.locals si getSession() renvoie null", async () => {
    // simuler une requete sans session valide
    const req = makeRequest();
    const res = { locals: {} } as unknown as Response;
    const next = vi.fn() as NextFunction;

    getSessionMock.mockResolvedValueOnce(null);

    // optionalAuth doit simplement appeler next() sans erreur et sans toucher a res.locals
    await optionalAuth(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(res.locals.userId).toBeUndefined();
  });

  it("peuple res.locals et appelle next() si une session valide existe", async () => {
    // simuler une requete avec une session valide retournee par Better Auth
    const req = makeRequest();
    const res = { locals: {} } as unknown as Response;
    const next = vi.fn() as NextFunction;

    getSessionMock.mockResolvedValueOnce(
      makeSessionResult("user-uuid", "news", "Marie Martin", "session-uuid"),
    );

    await optionalAuth(req, res, next);

    // res.locals doit etre peuple avec les infos de l'utilisateur et de la session
    expect(res.locals.userId).toBe("user-uuid");
    expect(res.locals.userRole).toBe("news");
    expect(res.locals.userDisplayName).toBe("Marie Martin");
    expect(res.locals.sessionId).toBe("session-uuid");
    expect(next).toHaveBeenCalledWith();
  });
});
