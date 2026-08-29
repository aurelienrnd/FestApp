import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { ERRORS } from "../errors/errorMessages.js";
import type { UserRole } from "../type.js";

/** Middleware factory qui restreint l'acces a une route selon le role de l'utilisateur connecte.
 * Doit etre place apres les middlewares `auth` et `sessionIsOpen`.
 * @param {...UserRole} roles Liste des roles autorises a acceder a la route
 */
export function requireRole(...roles: UserRole[]) {
  return (_req: Request, res: Response, next: NextFunction) => {
    // recupere le role de l'utilisateur a partir de res.locals
    const userRole: UserRole | undefined = res.locals.userRole;

    // si le role de l'utilisateur n'est pas dans la liste des roles autorises, renvoie une erreur 403
    if (!userRole || !roles.includes(userRole)) {
      throw new AppError(ERRORS.FORBIDDEN, 403);
    }
    next();
  };
}
