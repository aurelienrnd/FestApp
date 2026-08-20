// Middleware pour authentifier l'utilisateur via sa session Better Auth
import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth as betterAuth } from "../lib/auth.js";
import { AppError } from "../errors/AppError.js";
import { ERRORS } from "../errors/errorMessages.js";
import type { UserRole } from "../type.js";

/** Tente d'authentifier l'utilisateur sans bloquer la requete si absent ou invalide.
 * Peuple res.locals.userId, res.locals.userRole, res.locals.userDisplayName et
 * res.locals.sessionId si une session valide est trouvee.
 * Appelle next() dans tous les cas — utilise pour les routes semi-publiques.
 * @param req - la requête HTTP entrante
 * @param res - la réponse HTTP
 * @param next - la fonction de middleware suivante
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const result = await betterAuth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (result) {
    res.locals.userId = result.user.id;
    res.locals.userRole = result.user.role as UserRole;
    res.locals.userDisplayName = result.user.name;
    res.locals.sessionId = result.session.id;
  }

  next();
}

/** Verifie que l'utilisateur est authentifie ; bloque sinon.
 * Stocke le user et le sessionId dans res.locals pour les handlers suivants.
 * @param req - la requête HTTP entrante
 * @param res - la réponse HTTP
 * @param next - la fonction de middleware suivante
 */
export async function auth(req: Request, res: Response, next: NextFunction) {
  const result = await betterAuth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!result) {
    throw new AppError(ERRORS.AUTH_MISSING_SESSION, 401);
  }

  res.locals.userId = result.user.id;
  res.locals.userRole = result.user.role as UserRole;
  res.locals.userDisplayName = result.user.name;
  res.locals.sessionId = result.session.id;

  next();
}
