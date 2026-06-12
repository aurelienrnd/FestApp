import { z } from "zod";
import { validateBody } from "../../src/middlewares/validateBody";
import { AppError } from "../../src/errors/AppError";
import { ERRORS } from "../../src/errors/errorMessages";
import type { Request, Response, NextFunction } from "express";

// schema de test simple : nom de 2 caracteres minimum, trimme automatiquement
const schema = z.object({
  name: z.string().min(2).trim(),
});

// ---------------------------------------------------------------------------

describe("validateBody", () => {
  it("appelle next() si le body est valide selon le schema Zod", () => {
    // simuler une requete avec un body valide
    const req = { body: { name: "Jean" } } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    validateBody(schema)(req, res, next);

    // next doit etre appele sans argument
    expect(next).toHaveBeenCalledWith();
  });

  it("remplace req.body par les donnees parsees et transformees (trim)", () => {
    // simuler une requete avec des espaces autour du nom
    const req = { body: { name: "  Jean  " } } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    validateBody(schema)(req, res, next);

    // req.body doit etre remplace par la valeur trimmee
    expect(req.body).toEqual({ name: "Jean" });
  });

  it("appelle next(AppError) avec 400 si le body est invalide", () => {
    // simuler une requete avec un body qui ne respecte pas le schema (nom trop court)
    const req = { body: { name: "A" } } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    validateBody(schema)(req, res, next);

    // next doit etre appele avec une AppError 400
    expect(next).toHaveBeenCalledWith(
      new AppError(ERRORS.VALIDATION_INVALID_BODY, 400),
    );
  });

  it("appelle next(AppError) avec 400 si le body est vide", () => {
    // simuler une requete avec un body vide
    const req = { body: {} } as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    validateBody(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith(
      new AppError(ERRORS.VALIDATION_INVALID_BODY, 400),
    );
  });
});
