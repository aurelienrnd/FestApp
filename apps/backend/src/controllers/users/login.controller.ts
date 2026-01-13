// Import type
import type { Request, Response } from "express";
import type { DbUser } from "../../type.ts";

// Import Modul
import crypto from "crypto";
import { query } from "../../db";
import ms from "ms";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { serialize } from "cookie";

// Import function
import { envToStringValue, getEnv } from "../../functions";

/** Teste si l'utilisateur existe
 * S'il n'existe pas lance une erreur
 * @param {DbUser | undefined} user utilisateur dans la base de données
 */
function userExists(user: DbUser | undefined) {
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
function passwordIsValid(password: string, passwordHash: string) {
  const isPasswordValid = bcrypt.compareSync(password, passwordHash);
  if (!isPasswordValid) {
    throw new Error("email ou mot de passe incorrect");
  }
}

/** Créer un JTW
 * @param {DbUser} user Utilisateur dans la BDD
 * @param {string} JWT_SECRET Variable d'environnement
 * @param {string} JWT_EXPIRES_IN Variable d'environnement
 * @return jwt
 */
function initToken(
  user: DbUser,
  JWT_SECRET: string,
  JWT_EXPIRES_IN: string,
): string {
  return jwt.sign({ sub: user.id, role: "admin" }, getEnv(JWT_SECRET), {
    expiresIn: envToStringValue(JWT_EXPIRES_IN), //il peux recevoir des valleur en seconde ou en ms?
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
function serializeCookie(
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

/** Créer la session dans la BDD
 * @param {DbUser} user l'utilisateur de la requete
 * @function envToStringValue Permet d'ajouter le Type StringValue à une variable d'environnement
 * @function serializeCookie Crée un Cookie
 * @return un cookie
 */
async function generateSession(user: DbUser): Promise<string> {
  // crée une suite 64 octet et les transforme en hesxadecimal
  const refreshToken = crypto.randomBytes(64).toString("hex");

  // hash le token et produit un resulta en hexadecimal
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // Definie la date d'expiration du token via la variable d'environnement
  const expiresAt = new Date(
    Date.now() + ms(envToStringValue("REFRESH_TOKEN_EXPIRES_IN")),
  );

  // lance une requette SQL pour ouvrir la session dans la BDD
  await query(
    `INSERT INTO sessions (user_id, refresh_token_hash, expires_at) VALUES ($1, $2, $3)`,
    [user.id, refreshTokenHash, expiresAt],
  );

  // Inserre le token dans un cookie
  const refreshCookie = serializeCookie(
    "COOKIE_REFRESH_TOKEN_NAME",
    "COOKIE_REFRESH_TOKEN_SECURE",
    "COOKIE_REFRESH_TOKEN_SAME_SITE",
    refreshToken,
    "REFRESH_TOKEN_EXPIRES_IN",
  );

  return refreshCookie;
}

/**Créer un cookie avec un jwt
 * @param {DbUser} user un utilisateur dans la BDD
 * @function initToken Crée un JTW
 * @function serializeCookie Crée un Cookie
 * @return un cookie
 */
function generateAccessToken(user: DbUser): string {
  // générer un jwt pour le accessToken
  const accessToken = initToken(
    user,
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES_IN",
  );

  // Inserre le token dans un cookie
  const accessCookie = serializeCookie(
    "COOKIE_ACCESS_TOKEN_NAME",
    "COOKIE_ACCESS_TOKEN_SECURE",
    "COOKIE_ACCESS_TOKEN_SAME_SITE",
    accessToken,
    "JWT_ACCESS_EXPIRES_IN",
  );

  return accessCookie;
}

/**TODO A terminer
 - implementer logique role dans le access token
*/
export async function login(req: Request, res: Response) {
  try {
    // on verifie que l'email et le password sont fournis dans le bon format
    const email = String(req.body.email).trim().toLowerCase();
    const password = String(req.body.password);

    // Creation de la requette SQL pour recuperer l'utilisateur par email
    const result = await query<DbUser>(
      `SELECT id, email, password_hash, display_name, is_active
      FROM users
      WHERE email = $1
      LIMIT 1`,
      [email],
    );
    const user = result[0];

    // on verifie que l'utilisateur existe et que le mot de passe est correct
    userExists(user);
    passwordIsValid(password, user.password_hash);

    //Creation des cookies et ajout du cookie dans le header de la reponse
    const refreshCookie: string = await generateSession(user);
    const accessCookie: string = generateAccessToken(user);
    res.setHeader("Set-Cookie", [accessCookie, refreshCookie]);

    // Edit la reponsse
    const userSession = await query(
      `SELECT id, user_id, expires_at, created_at FROM sessions WHERE $1 = user_id ORDER BY created_at DESC LIMIT 1`,
      [user.id],
    );

    // reponse avec les informations de l'utilisateur
    return res.status(200).json({
      message: "Authentification réussie",
      userSession,
    });
  } catch (error: any) {
    console.error(error);
    return res
      .status(error.status || 401)
      .json({ error: error.message || "Internal Server Error" });
  }
}
