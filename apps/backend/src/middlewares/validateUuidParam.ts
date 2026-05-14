import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../errors/AppError";
import { ERRORS } from "../errors/errorMessages";

/** Retourne un middleware Express qui valide qu'un parametre de route est un UUID valide.
 * Si la validation echoue, une erreur 400 est transmise au middleware d'erreur.
 * @param paramName nom du parametre de route a valider (defaut : "id")
 * @returns Middleware Express
 */
export function validateUuidParam(paramName = "id") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const schema = z.object({ [paramName]: z.uuid() });
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(new AppError(ERRORS.VALIDATION_INVALID_BODY, 400));
    }
    return next();
  };
}
