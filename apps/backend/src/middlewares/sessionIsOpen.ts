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
} from "../functions";

/** Verifie si la session est valide puis renouvelle le token d'acces. */
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

  // Génère un nouveau token d'accès JWT
  const accessToken = initToken(
    reqUserId,
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES_IN",
    reqSessionId,
  );

  // Sérialise un cookie
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
