// Import type
import type { Request, Response } from "express";
import type { DbUser } from "../../../type.js";

// Import Modul
import { query } from "../../../db";
import ms from "ms";

// Import function
import {
  envToStringValue,
  userExists,
  passwordIsValid,
  initToken,
  serializeCookie,
} from "../../../functions";

/** Créer la session dans la BDD
 * @param {DbUser} user l'utilisateur de la requete
 * @param {string} SESSION_EXPIRES_IN Variable d'environement
 * @function envToStringValue Permet d'ajouter le Type StringValue à une variable d'environnement
 * @return l'ID de la session dans la BDD
 */
export async function generateSession(
  user: DbUser,
  SESSION_EXPIRES_IN: string,
) {
  // Definie la date d'expiration du token via la variable d'environnement
  const expiresAt = new Date(
    Date.now() + ms(envToStringValue(SESSION_EXPIRES_IN)),
  );

  // lance une requette SQL pour ouvrir la session dans la BDD
  const rows = await query(
    `INSERT INTO sessions (user_id, expires_at) VALUES ($1, $2) RETURNING id`,
    [user.id, expiresAt],
  );

  const sessionId = rows[0].id;

  return sessionId;
}

/** Connexion l'utilisateur au service
 * Verifie si l'utilisateur existe dans la BDD
 * Cree une session
 * Renvoie un token et un cookie pour l'authentification
 * @function userExists Teste si l'utilisateur existe
 * @function passwordIsValid Compare le mot de passe de la requete avec le hash dans la BDD
 * @function generateSession Créer la session dans la BDD
 * @function initToken Créer un JTW
 * @function serializeCookie Créer un Cookie
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

    //Creation du cookies et ajout dans le header de la reponse
    const sessionId = await generateSession(user, "SESSION_EXPIRES_IN");
    const userId = user.id;
    const accessToken = initToken(
      userId,
      "JWT_ACCESS_SECRET",
      "JWT_ACCESS_EXPIRES_IN",
      sessionId,
    );

    //TODO - remove it
    console.log("Token a la connexion", accessToken);

    const accessCookie = serializeCookie(
      "COOKIE_ACCESS_TOKEN_NAME",
      "COOKIE_ACCESS_TOKEN_SECURE",
      "COOKIE_ACCESS_TOKEN_SAME_SITE",
      accessToken,
      "JWT_ACCESS_EXPIRES_IN",
    );
    res.setHeader("Set-Cookie", accessCookie);

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
