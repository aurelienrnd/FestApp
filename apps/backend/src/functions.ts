import type { StringValue } from "ms";
import ms from "ms";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { serialize } from "cookie";
import type { DbUser } from "../src/type";
import type { SessionRow } from "../src/type";
import { AppError } from "./errors/AppError";
import { ERRORS } from "./errors/errorMessages";

/** Verifie si la variable d'environnement existe et renvoie une erreur si non
 * Permet de gerer le typage
 * @param {string} name nom de la variable d'environnement
 * @returns {string}
 */
export function getEnv(name: string): string {
  const variables = process.env[name];
  if (!variables) throw new Error(`Missing env var: ${name}`);
  return variables;
}

/** Permet d'ajouter le type StringValue a une variable d'environnement
 * ou lance une erreur si ce n'est pas possible
 * @param {string} name nom de la variable d'environnement
 * @returns {StringValue}
 */
export function envToStringValue(name: string): StringValue {
  const value = getEnv(name);
  if (!/^\d+(\s?[a-zA-Z]+)?$/.test(value)) {
    throw new Error(`Invalid duration for ${name}`);
  }
  return value as StringValue;
}

/** Teste si l'utilisateur existe
 * @param {DbUser | undefined} user utilisateur dans la base de donnees
 */
export function userExists(user: DbUser | undefined) {
  if (!user) {
    throw new AppError(ERRORS.AUTH_INVALID_CREDENTIALS, 401);
  }
}

/** Compare le mot de passe de la requete avec le hash en BDD
 * @param {string} password mot de passe de la requete
 * @param {string} passwordHash mot de passe hash en BDD
 */
export function passwordIsValid(password: string, passwordHash: string) {
  const isPasswordValid = bcrypt.compareSync(password, passwordHash);
  if (!isPasswordValid) {
    throw new AppError(ERRORS.AUTH_INVALID_CREDENTIALS, 401);
  }
}

/** Cree un JWT
 * @param {string} userId id utilisateur
 * @param {string} JWT_SECRET variable d'environnement
 * @param {string} JWT_EXPIRES_IN variable d'environnement
 * @param {string} sessionId id de la session en BDD
 * @return jwt
 */
export function initToken(
  userId: string,
  JWT_SECRET: string,
  JWT_EXPIRES_IN: string,
  sessionId: string,
): string {
  return jwt.sign({ userId, sessionId }, getEnv(JWT_SECRET), {
    expiresIn: envToStringValue(JWT_EXPIRES_IN),
  });
}

/** Cree un cookie
 * @param {string} EnvName variable d'environnement
 * @param {string} envSecure variable d'environnement
 * @param {string} envSameSite variable d'environnement
 * @param {string} token token a renvoyer dans le cookie
 * @param {string} time duree avant expiration du cookie
 * @return cookie
 */
export function serializeCookie(
  EnvName: string,
  envSecure: string,
  envSameSite: string,
  token: string,
  time: string,
): string {
  const cookieName = getEnv(EnvName);
  const secure = getEnv(envSecure) === "true";
  const sameSite = getEnv(envSameSite) as "lax" | "strict" | "none";
  const timeS = ms(envToStringValue(time)) / 1000;

  return serialize(cookieName, token, {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: timeS,
  });
}

/** Verifie si la session existe
 * @param {SessionRow | undefined} sessionBdd session en BDD
 */
export function sessionExists(sessionBdd: SessionRow | undefined) {
  if (!sessionBdd) {
    throw new AppError(ERRORS.SESSION_NOT_FOUND, 401);
  }
}

/** Verifie si la session est deja revoquee ou expiree
 * @param {SessionRow | undefined} sessionBdd session en BDD
 */
export function sessionRevoked(sessionBdd: SessionRow | undefined) {
  if (
    !sessionBdd ||
    sessionBdd.revoked_at !== null ||
    new Date(sessionBdd.expires_at) < new Date()
  ) {
    throw new AppError(ERRORS.SESSION_ALREADY_CLOSED, 401);
  }
}

/** Verifie que l'identifiant utilisateur est present dans la requete.
 * @param {string | string[] | undefined} reqUserId userId provenant des headers
 * @returns {string}
 */
export function requireUserId(
  reqUserId: string | string[] | undefined,
): string {
  const userId = Array.isArray(reqUserId) ? reqUserId[0] : reqUserId;
  if (!userId) {
    throw new AppError(ERRORS.AUTH_MISSING_USER, 401);
  }
  return userId;
}

/** Verifie que l'identifiant de session est present dans la requete.
 * @param {string | string[] | undefined} reqSessionId sessionId provenant des headers
 * @returns {string}
 */
export function requireSessionId(
  reqSessionId: string | string[] | undefined,
): string {
  const sessionId = Array.isArray(reqSessionId)
    ? reqSessionId[0]
    : reqSessionId;
  if (!sessionId) {
    throw new AppError(ERRORS.AUTH_MISSING_SESSION, 401);
  }
  return sessionId;
}
