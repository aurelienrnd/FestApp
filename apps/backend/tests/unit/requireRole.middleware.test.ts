import { requireRole } from "../../src/middlewares/requireRole";
import { AppError } from "../../src/errors/AppError";
import { ERRORS } from "../../src/errors/errorMessages";
import type { Request, Response, NextFunction } from "express";

// ---------------------------------------------------------------------------

describe("requireRole", () => {
  it("appelle next() si le role de l'utilisateur est dans la liste autorisee", () => {
    // simuler res.locals avec un role autorise
    const req = {} as Request;
    const res = { locals: { userRole: "admin" } } as unknown as Response;
    const next = vi.fn() as NextFunction;

    // le middleware doit appeler next() sans argument
    requireRole("admin", "news")(req, res, next);

    // next doit etre appele sans argument
    expect(next).toHaveBeenCalledWith();
  });

  it("throw AppError(FORBIDDEN, 403) si le role n'est pas dans la liste autorisee", () => {
    // simuler res.locals avec un role non autorise
    const req = {} as Request;
    const res = { locals: { userRole: "news" } } as unknown as Response;
    const next = vi.fn() as NextFunction;

    // le middleware throw directement — on capture l'erreur
    expect(() => requireRole("admin")(req, res, next)).toThrow(
      new AppError(ERRORS.FORBIDDEN, 403),
    );
  });

  it("throw AppError(FORBIDDEN, 403) si res.locals.userRole est absent", () => {
    // simuler res.locals sans role (middleware auth non execute ou non authentifie)
    const req = {} as Request;
    const res = { locals: {} } as unknown as Response;
    const next = vi.fn() as NextFunction;

    expect(() => requireRole("admin")(req, res, next)).toThrow(
      new AppError(ERRORS.FORBIDDEN, 403),
    );
  });
});
