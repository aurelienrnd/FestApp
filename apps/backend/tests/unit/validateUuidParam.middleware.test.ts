import { validateUuidParam } from "../../src/middlewares/validateUuidParam";
import { AppError } from "../../src/errors/AppError";
import { ERRORS } from "../../src/errors/errorMessages";
import type { Request, Response, NextFunction } from "express";

// ---------------------------------------------------------------------------

describe("validateUuidParam", () => {
  it("appelle next() si le parametre est un UUID valide", () => {
    // simuler une requete avec un UUID valide dans les parametres
    const req = {
      params: { id: "123e4567-e89b-12d3-a456-426614174000" },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    validateUuidParam()(req, res, next);

    // next doit etre appele sans argument
    expect(next).toHaveBeenCalledWith();
  });

  it("appelle next(AppError) avec 400 si le parametre n'est pas un UUID", () => {
    // simuler une requete avec un id qui n'est pas un UUID
    const req = { params: { id: "pas-un-uuid" } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    validateUuidParam()(req, res, next);

    // next doit etre appele avec une AppError 400
    expect(next).toHaveBeenCalledWith(
      new AppError(ERRORS.VALIDATION_INVALID_BODY, 400),
    );
  });

  it("appelle next(AppError) avec 400 si le parametre est absent", () => {
    // simuler une requete sans parametre id
    const req = { params: {} } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    validateUuidParam()(req, res, next);

    expect(next).toHaveBeenCalledWith(
      new AppError(ERRORS.VALIDATION_INVALID_BODY, 400),
    );
  });

  it("valide un parametre avec un nom personnalise", () => {
    // simuler une requete avec un parametre nomme "artistId"
    const req = {
      params: { artistId: "123e4567-e89b-12d3-a456-426614174000" },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    validateUuidParam("artistId")(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
