// Middleware pour authentifier l'utilisateur via son token
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { getEnv } from "../functions";
import type { JwtPayload } from "jsonwebtoken";
import { query } from "../db";
import { AppError } from "../errors/AppError";
import { ERRORS } from "../errors/errorMessages";

/** Verifie qu'un token est present dans le cookie de la requete
 * @return le token
 */
function getTokenFromCookie(req: Request) {
  // Refuse la requête si aucun cookie n'est envoyé,
  if (!req.headers.cookie) {
    throw new AppError(ERRORS.AUTH_MISSING_COOKIE, 401);
  }

  // Récupère le cookie depuis le header de la requête,
  const cookies = parse(req.headers.cookie);
  const cookieName = getEnv("COOKIE_ACCESS_TOKEN_NAME");
  const token = cookies[cookieName];

  // Si le cookie d'accès ne contient pas de token, on bloque la requête
  if (!token) {
    throw new AppError(ERRORS.AUTH_MISSING_ACCESS_TOKEN, 401);
  }

  return token;
}

/** Decode le token JWT pour recuperer le userId et le sessionId
 * @return le userId et le sessionId
 */
function decodedToken(token: string) {
  let decodedToken: JwtPayload;
  try {
    // Decode le JWT
    decodedToken = jwt.verify(token, getEnv("JWT_ACCESS_SECRET")) as JwtPayload;
  } catch {
    // Token invalide/expiré : on renvoie une erreur d'authentification.
    throw new AppError(ERRORS.AUTH_INVALID_ACCESS_TOKEN, 401);
  }

  // Extrait les identifiants utilisateur et session depuis le payload JWT décodé.
  const userId = decodedToken.userId;
  const sessionId = decodedToken.sessionId;
  return { userId, sessionId };
}

/** Verifie que l'utilisateur est autorise a effectuer cette requete
 * Recupere et decode le token
 * Recherche l'utilisateur dans la BDD
 * Stocke le user et le sessionId dans res.locals pour les handlers suivants
 * @function getTokenFromCookie Verifie qu'un token est present dans le cookie de la requete
 * @function decodedToken Decode le token JWT pour recuperer le userId et le sessionId
 */
export async function auth(req: Request, res: Response, next: NextFunction) {
  // Récupère les id depuis le token d'accès depuis les cookies,
  const token = getTokenFromCookie(req);
  const { userId, sessionId } = decodedToken(token);

  // Cherche l'utilisateur correspondant à l'userId extrait du token
  const user = await query("SELECT id, display_name FROM users WHERE id = $1", [
    userId,
  ]);
  if (!user[0]) {
    throw new AppError(ERRORS.AUTH_USER_NOT_FOUND, 401);
  }

  // // Stocke les infos d'authentification dans `res.locals`
  res.locals.userId = user[0].id;
  res.locals.userDisplayName = user[0].display_name;
  res.locals.sessionId = sessionId;

  next();
}
