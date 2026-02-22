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
  const reqSessionId = requireSessionId(res.locals.sessionId);
  const reqUserId = requireUserId(res.locals.userId);

  const rows = await query<SessionRow>(
    "SELECT id, user_id, expires_at, revoked_at FROM sessions WHERE id = $1 AND user_id = $2",
    [reqSessionId, reqUserId],
  );
  const sessionBdd = rows[0];

  sessionExists(sessionBdd);
  sessionRevoked(sessionBdd);

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
  res.setHeader("Set-Cookie", accessCookie);

  next();
}
