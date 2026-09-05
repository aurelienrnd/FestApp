import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { AppError } from "../errors/AppError.js";
import { ERRORS } from "../errors/errorMessages.js";

/** Verifie qu'une session Better Auth valide est presente et peuple res.locals.
 * Better Auth gere lui-meme le decodage du cookie de session et sa validite (expiration, revocation).
 * @param req - la requête HTTP entrante
 * @param res - la réponse HTTP
 * @param next - la fonction de middleware suivante
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const result = await auth.api.getSession({

    // fromNodeHeaders : convertit les en-tetes de la requete Express en un format compatible avec Better Auth. 
    headers: fromNodeHeaders(req.headers),
  });

  // Si aucune session n'est presente, renvoie une erreur 401 Unauthorized.
  if (!result) {
    throw new AppError(ERRORS.AUTH_MISSING_SESSION, 401);
  }

  // Si une session est presente, on la stocke dans res.locals pour que les routes puissent y acceder.
  res.locals.userId = result.user.id;
  res.locals.sessionId = result.session.id;
  res.locals.userRole = result.user.role ?? undefined; // colonne nullable en BDD, res.locals.userRole ne connait pas `null`

  next();
}
