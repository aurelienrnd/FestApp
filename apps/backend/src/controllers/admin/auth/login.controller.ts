import type { Request, Response } from "express";
import type { DbUser } from "../../../type.js";
import ms from "ms";

import { query } from "../../../db";
import {
  envToStringValue,
  userExists,
  passwordIsValid,
  initToken,
  serializeCookie,
} from "../../../functions";

/** Cree la session dans la BDD
 * @param {DbUser} user utilisateur de la requete
 * @param {string} SESSION_EXPIRES_IN variable d'environnement
 * @return l'ID de la session dans la BDD
 */
export async function generateSession(
  user: DbUser,
  SESSION_EXPIRES_IN: string,
) {
  const expiresAt = new Date(
    Date.now() + ms(envToStringValue(SESSION_EXPIRES_IN)),
  );

  const rows = await query(
    `INSERT INTO sessions (user_id, expires_at) VALUES ($1, $2) RETURNING id`,
    [user.id, expiresAt],
  );

  return rows[0].id;
}

/** Connexion de l'utilisateur au service
 * Verifie que l'utilisateur existe dans la BDD
 * Cree une session
 * Renvoie un token et un cookie pour l'authentification
 */
export async function login(req: Request, res: Response) {
  const email = String(req.body.email).trim().toLowerCase();
  const password = String(req.body.password);

  const result = await query<DbUser>(
    `SELECT id, email, password_hash, display_name, is_active
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );
  const user = result[0];

  userExists(user);
  passwordIsValid(password, user.password_hash);

  const sessionId = await generateSession(user, "SESSION_EXPIRES_IN");
  const accessToken = initToken(
    user.id,
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES_IN",
    sessionId,
  );

  // TODO - remove it for production
  console.log("Token a la connexion", accessToken);

  const accessCookie = serializeCookie(
    "COOKIE_ACCESS_TOKEN_NAME",
    "COOKIE_ACCESS_TOKEN_SECURE",
    "COOKIE_ACCESS_TOKEN_SAME_SITE",
    accessToken,
    "JWT_ACCESS_EXPIRES_IN",
  );
  res.setHeader("Set-Cookie", accessCookie);

  const userSession = await query(
    `SELECT id, user_id, expires_at, created_at FROM sessions WHERE $1 = user_id ORDER BY created_at DESC LIMIT 1`,
    [user.id],
  );

  return res.status(200).json({
    message: "Authentification réussie",
    userSession,
  });
}
