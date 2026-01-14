import type { StringValue } from "ms";
import ms from "ms";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { serialize } from "cookie";
import type { DbUser } from "../src/type";

/** Verifie si la variable d'environnement existe et renvoie une erreur si non
 * Permet de gérer le typage
 * @param {string} name : nom de la variable d'environnement
 * @returns {string}
 */
export function getEnv(name: string): string {
  const variables = process.env[name];
  if (!variables) throw new Error(`Missing env var: ${name}`);
  return variables;
}

/** Permet d'ajouter le Type StringValue à une variable d'environnement
 * ou lance une erreur si ce n'est pas possible
 * @param {string} name nom de la variable d'environnement
 * @function getEnv Verifie si la variable d'environnement existe
 * @returns {Stringvalue}
 */
export function envToStringValue(name: string): StringValue {
  const value = getEnv(name);
  if (!/^\d+(\s?[a-zA-Z]+)?$/.test(value)) {
    throw new Error(`Invalid duration for ${name}`);
  }
  return value as StringValue;
}

/** Teste si l'utilisateur existe
 * S'il n'existe pas lance une erreur
 * @param {DbUser | undefined} user utilisateur dans la base de données
 */
export function userExists(user: DbUser | undefined) {
  if (!user) {
    const message: string = "email ou mot de passe incorrect";
    throw new Error("email ou mot de passe incorrect");
  }
}

/** Compare le mot de passe de la requete avec le hash dans la BDD
 * S'ils ne sont pas comparables alors on lève une erreur
 * @param {string} password mot de passe dans la requete
 * @param {string} passwordHash Mot de passe dans la BDD
 */
export function passwordIsValid(password: string, passwordHash: string) {
  const isPasswordValid = bcrypt.compareSync(password, passwordHash);
  if (!isPasswordValid) {
    throw new Error("email ou mot de passe incorrect");
  }
}

/** Créer un JTW
 * @param {DbUser} user Utilisateur dans la BDD
 * @param {string} JWT_SECRET Variable d'environnement
 * @param {string} JWT_EXPIRES_IN Variable d'environnement
 * @param {string} sessionId Id de le session dans la BDD
 * @return jwt
 */
export function initToken(
  userId: string,
  JWT_SECRET: string,
  JWT_EXPIRES_IN: string,
  sessionId: string,
): string {
  return jwt.sign({ userId, sessionId }, getEnv(JWT_SECRET), {
    expiresIn: envToStringValue(JWT_EXPIRES_IN), //il peux recevoir des valleur en seconde ou en ms
  });
}

/** Créer un Cookie
 * @param {string} EnvName Variable d'environement
 * @param {string} envSecure Variable d'environement
 * @param {string} envSameSite Variable d'environement
 * @param {string} token Token a renvoyer dans le cookie
 * @param {string} time Temps avant expiration du cookie
 * @function getEnv Verifie si la variable d'environement existe
 * @function envToStringValue Permet d'ajouter le Type StringValue a une variable d'environement
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
  const secure = getEnv(envSecure) === "true"; // oblige le cookie à être transmis uniquement via HTTPS, cookie doit recevoir un boolean
  const sameSite = getEnv(envSameSite) as "lax" | "strict" | "none"; // definit la politique SameSite pour le cookie
  const timeS = ms(envToStringValue(time)) / 1000;

  return serialize(cookieName, token, {
    httpOnly: true, // empêche l'accès au cookie via JavaScript côté client, réduisant les risques de vol de cookie via des attaques XSS
    secure,
    sameSite,
    path: "/", // rend le cookie accessible sur l'ensemble du site
    maxAge: timeS, // durée de vie du cookie en secondes (ici 1 heure)
  });
}
