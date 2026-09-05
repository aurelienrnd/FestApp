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
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    throw new AppError(ERRORS.AUTH_MISSING_SESSION, 401);
  }

  res.locals.userId = session.user.id;
  res.locals.sessionId = session.session.id;

  next();
}
