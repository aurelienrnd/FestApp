// Middleware pour authentifier l'utilisateur via son token
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { getEnv } from "../functions";
import type { JwtPayload } from "jsonwebtoken";
import { query } from "../db";
import { AppError } from "../errors/AppError";

/** Verifie qu'un token est present dans le cookie de la requete
 * @return le token
 */
function getTokenFromCookie(req: Request) {
  if (!req.headers.cookie) {
    throw new AppError("missing cookie", 401);
  }

  const cookies = parse(req.headers.cookie);
  const cookieName = getEnv("COOKIE_ACCESS_TOKEN_NAME");
  const token = cookies[cookieName];

  if (!token) {
    throw new AppError("missing access token", 401);
  }

  return token;
}

/** Decode le token JWT pour recuperer le userId et le sessionId
 * @return le userId et le sessionId
 */
function decodedToken(token: string) {
  const decodedToken = jwt.verify(
    token,
    getEnv("JWT_ACCESS_SECRET"),
  ) as JwtPayload;
  const userId = decodedToken.userId;
  const sessionId = decodedToken.sessionId;
  return { userId, sessionId };
}

/** Verifie que l'utilisateur est autorise a effectuer cette requete
 * Recupere et decode le token
 * Recherche l'utilisateur dans la BDD
 * Stocke le user et le sessionId dans res.locals pour les handlers suivants
 */
export async function auth(req: Request, res: Response, next: NextFunction) {
  const token = getTokenFromCookie(req);
  const { userId, sessionId } = decodedToken(token);

  const user = await query("SELECT id, display_name FROM users WHERE id = $1", [
    userId,
  ]);
  if (!user[0]) {
    throw new AppError("User not found", 401);
  }

  res.locals.userId = user[0].id;
  res.locals.userDisplayName = user[0].display_name;
  res.locals.sessionId = sessionId;

  next();
}
