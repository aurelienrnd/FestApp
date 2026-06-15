import { Request, Response, NextFunction } from "express";
import { query } from "../db";
import type { SessionRow } from "../type";
import {
  initToken,
  requireSessionId,
  requireUserId,
  serializeCookie,
  sessionExists,
  sessionRevoked,
} from "../utils";

/** Verifie si la session est valide puis renouvelle le token d'acces.
 * @param req - la requête HTTP entrante
 * @param res - la réponse HTTP
 * @param next - la fonction de middleware suivante
 * @function requireSessionId Verifie que le sessionId est present dans res.locals
 * @function requireUserId Verifie que le userId est present dans res.locals
 * @function sessionExists Verifie que la session existe en base de donnees
 * @function sessionRevoked Verifie que la session n'est pas revoquee
 * @function initToken Genere un nouveau token d'acces JWT
 * @function serializeCookie Genere un cookie a partir du token d'acces
 * @function query Execute une requete SQL sur la base de donnees
 */
export async function sessionIsOpen(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  // Récupère les identifiants de session depuis `res.locals`.
  const reqSessionId = requireSessionId(res.locals.sessionId);
  const reqUserId = requireUserId(res.locals.userId);

  // Recherche en base la session correspondant au identifiants
  const rows = await query<SessionRow>(
    "SELECT id, user_id, expires_at, revoked_at FROM sessions WHERE id = $1 AND user_id = $2",
    [reqSessionId, reqUserId],
  );
  const sessionBdd = rows[0];

  // Vérifie que la session existe bien et qu'elle n'a pas été révoquée.
  sessionExists(sessionBdd);
  sessionRevoked(sessionBdd);

  // Génère un nouveau token d'accès JWT puis le sérialise dans un cookie HTTP.
  const accessToken = initToken(
    reqUserId,
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES_IN",
    reqSessionId,
  );
  const accessCookie = serializeCookie(
    "COOKIE_ACCESS_TOKEN_NAME",
    "COOKIE_ACCESS_TOKEN_SECURE",
    "COOKIE_ACCESS_TOKEN_SAME_SITE",
    accessToken,
    "JWT_ACCESS_EXPIRES_IN",
  );

  // Repond avec le cookie
  res.setHeader("Set-Cookie", accessCookie);

  next();
}
