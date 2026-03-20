import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { ERRORS } from "../errors/errorMessages";

/** Middleware factory qui restreint l'acces a une route selon le role de l'utilisateur connecte.
 * Doit etre place apres les middlewares `auth` et `sessionIsOpen`.
 * @param {...string} roles Liste des roles autorises a acceder a la route
 */
export function requireRole(...roles: string[]) {
  return (_req: Request, res: Response, next: NextFunction) => {
    // recupere le role de l'utilisateur a partir de res.locals
    const userRole: string | undefined = res.locals.userRole;

    // si le role de l'utilisateur n'est pas dans la liste des roles autorises, renvoie une erreur 403
    if (!userRole || !roles.includes(userRole)) {
      throw new AppError(ERRORS.FORBIDDEN, 403);
    }
    next();
  };
}
