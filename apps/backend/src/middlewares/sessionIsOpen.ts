import { Request, Response, NextFunction } from "express";

// Import function
import { query } from "../db";
import {
  initToken,
  serializeCookie,
} from "../controllers/users/login.controller";

/** Compare le sessionId du header avec celui de la BDD pour renouveler ou non le initToken
 * Verifie si la session est valide (non révoquée et non expirée)
 * Si la session est valide, renouvelle le token et le cookie
 * Sinon, renvoie une erreur 401
 * @middleware
 * @requires query
 * @function initToken
 * @function serializeCookie
 */
export async function sessionIsOpen(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // récupération des info du headers
  const reqSessionId = req.headers.session;
  const reqUserId = req.headers.userId;

  // requête en BDD recupérant la session
  const row = await query(
    "SELECT id, user_id, expires_at, revoked_at FROM sessions WHERE id = $1 AND user_id = $2",
    [reqSessionId, reqUserId],
  );
  const sessionBdd = row[0];

  // Verifie si la session est valide
  if (!sessionBdd) {
    return res.status(401).json({ message: "Session invalide" });
  } else if (
    sessionBdd.revoked_at !== null ||
    new Date(sessionBdd.expires_at) < new Date()
  ) {
    return res.status(401).json({ message: "Session révoquée ou expirée" });
  }

  // Si la session est valide, on renouvelle le token et le cookie
  const accessToken = initToken(
    reqUserId as string,
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES_IN",
    reqSessionId as string,
  );
  //TODO - remove it
  console.log("nouveau token", accessToken);
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
