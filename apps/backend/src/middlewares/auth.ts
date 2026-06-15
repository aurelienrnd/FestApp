// Middleware pour authentifier l'utilisateur via son token
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { getEnv } from "../utils";
import type { JwtPayload } from "jsonwebtoken";
import { query } from "../db";
import { AppError } from "../errors/AppError";
import { ERRORS } from "../errors/errorMessages";
import type { UserItem, SessionRow } from "../type";

type AuthUserRow = Pick<UserItem, "id" | "display_name" | "role">;

/** Verifie qu'un token est present dans le cookie de la requete
 * @param req - la requête HTTP entrante
 * @function getEnv Recupere la valeur d'une variable d'environnement
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
 * @param token - le token JWT à décoder
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

/** Tente d'authentifier l'utilisateur sans bloquer la requete si absent ou invalide.
 * Peuple res.locals.userId, res.locals.userRole et res.locals.userDisplayName si le token est valide.
 * Appelle next() dans tous les cas — utilise pour les routes semi-publiques.
 * @param req - la requête HTTP entrante
 * @param res - la réponse HTTP
 * @param next - la fonction de middleware suivante
 * @function getTokenFromCookie Verifie qu'un token est present dans le cookie de la requete
 * @function decodedToken Decode le token JWT pour recuperer le userId et le sessionId
 * @function query Execute une requete SQL sur la base de donnees
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Récupère les id depuis le token d'accès depuis les cookies,
    const token = getTokenFromCookie(req);
    const { userId, sessionId } = decodedToken(token);

    // Cherche l'utilisateur correspondant à l'userId extrait du token et renvoie sont nom et sont role
    const user = await query<AuthUserRow>(
      "SELECT id, display_name, role FROM users WHERE id = $1",
      [userId],
    );

    // Si l'utilisateur n'existe pas, on continue sans authentification
    if (!user[0]) {
      return next();
    }

    // Verifie que la session existe et n'est pas revoquee (logout invalide la session en BD)
    const sessions = await query<
      Pick<SessionRow, "id" | "revoked_at" | "expires_at">
    >(
      "SELECT id, revoked_at, expires_at FROM sessions WHERE id = $1 AND user_id = $2",
      [sessionId, userId],
    );

    // Si la session est valide, on stocke les infos d'authentification dans `res.locals`
    if (
      sessions[0] &&
      sessions[0].revoked_at === null &&
      new Date(sessions[0].expires_at) > new Date()
    ) {
      res.locals.userId = user[0].id;
      res.locals.userRole = user[0].role;
      res.locals.userDisplayName = user[0].display_name;
      res.locals.sessionId = sessionId;
    }
  } catch {
    // token absent ou invalide — on continue sans authentification
  }

  next();
}

/** Verifie que l'utilisateur est autorise a effectuer cette requete
 * Recupere et decode le token
 * Recherche l'utilisateur dans la BDD
 * Stocke le user et le sessionId dans res.locals pour les handlers suivants
 * @param req - la requête HTTP entrante
 * @param res - la réponse HTTP
 * @param next - la fonction de middleware suivante
 * @function getTokenFromCookie Verifie qu'un token est present dans le cookie de la requete
 * @function decodedToken Decode le token JWT pour recuperer le userId et le sessionId
 * @function query Execute une requete SQL sur la base de donnees
 */
export async function auth(req: Request, res: Response, next: NextFunction) {
  // Récupère les id depuis le token d'accès depuis les cookies,
  const token = getTokenFromCookie(req);
  const { userId, sessionId } = decodedToken(token);

  // Cherche l'utilisateur correspondant à l'userId extrait du token et renvoie sont nom et sont role
  const user = await query<AuthUserRow>(
    "SELECT id, display_name, role FROM users WHERE id = $1",
    [userId],
  );

  // Si l'utilisateur n'existe pas, on renvoie une erreur d'authentification
  if (!user[0]) {
    throw new AppError(ERRORS.AUTH_USER_NOT_FOUND, 401);
  }

  // // Stocke les infos d'authentification dans `res.locals`
  res.locals.userId = user[0].id;
  res.locals.userRole = user[0].role;
  res.locals.userDisplayName = user[0].display_name;
  res.locals.sessionId = sessionId;

  next();
}
