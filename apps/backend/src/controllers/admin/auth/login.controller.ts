import type { Request, Response } from "express";
import type { UserCredentialsRow, IdRow } from "../../../type.js";
import ms from "ms";

import { query } from "../../../db";
import {
  envToStringValue,
  userExists,
  passwordIsValid,
  initToken,
  serializeCookie,
} from "../../../utils";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";

/** Cree la session dans la BDD
 * @param {UserCredentialsRow} user utilisateur de la requete
 * @param {string} SESSION_EXPIRES_IN variable d'environnement
 * @return l'ID de la session dans la BDD
 */
export async function generateSession(
  user: UserCredentialsRow,
  SESSION_EXPIRES_IN: string,
) {
  // Calcule la date d'expiration de la session via la varible d'environement
  const expiresAt = new Date(
    Date.now() + ms(envToStringValue(SESSION_EXPIRES_IN)),
  );

  // Crée une nouvelle session en base pour l'utilisateur
  const rows = await query<IdRow>(
    `INSERT INTO sessions (user_id, expires_at) VALUES ($1, $2) RETURNING id`,
    [user.id, expiresAt],
  );
  if (!rows[0]) {
    throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);
  }

  return rows[0].id;
}

/** Connexion de l'utilisateur au service
 * Verifie que l'utilisateur existe dans la BDD
 * Cree une session
 * Renvoie un token et un cookie pour l'authentification
 * @function userExists
 * @function passwordIsValid
 * @function generateSession
 */
export async function login(req: Request, res: Response) {
  // Récupère le mot de passe et l'email dans la requete et dans la BDD
  const email = String(req.body.email).trim().toLowerCase();
  const password = String(req.body.password);
  const result = await query<UserCredentialsRow>(
    `SELECT id, email, password_hash, display_name
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );
  const user = result[0];

  // Vérifie que l'utilisateur existe et que le mot et correspond bien au hash en BDD.
  userExists(user);
  passwordIsValid(password, user.password_hash);

  // Crée une session pour l'utilisateur, puis génère un JWT d'accès
  const sessionId = await generateSession(user, "SESSION_EXPIRES_IN");
  const accessToken = initToken(
    user.id,
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES_IN",
    sessionId,
  );

  // Construit le cookie HTTP contenant le token puis l'ajoute au header
  const accessCookie = serializeCookie(
    "COOKIE_ACCESS_TOKEN_NAME",
    "COOKIE_ACCESS_TOKEN_SECURE",
    "COOKIE_ACCESS_TOKEN_SAME_SITE",
    accessToken,
    "JWT_ACCESS_EXPIRES_IN",
  );
  res.setHeader("Set-Cookie", accessCookie);

  return res.status(200).json({
    message: "Authentification reussie",
  });
}
