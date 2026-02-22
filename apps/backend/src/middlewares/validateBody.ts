import type { NextFunction, Request, Response } from "express";
import * as z from "zod";
import { AppError } from "../errors/AppError";

/** Retourne un middleware Express qui valide `req.body`.
 * Si la validation echoue, une reponse 400 est renvoyee.
 * @param schema Schema Zod utilise pour valider le corps de la requete.
 * @returns Middleware Express avec donnees validees.
 */
export function validateBody(schema: z.ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError("Donnees invalides", 400));
    }

    req.body = parsed.data;
    return next();
  };
}
