import type { Request, Response } from "express";
import crypto from "crypto";
import { query } from "../../db";
import ms from "ms";
import {
  userExists,
  passwordIsValid,
  initToken,
  serializeCookie,
  envToStringValue,
} from "../../functions";
import type { DbUser } from "../../type.ts";

/**TODO A terminer
 - implementer logique pour "session.user_agent" "session.ip"
 - implementer logique role dans le access token
 - Decouper en fonction 
 - Commenter
*/
export async function login(req: Request, res: Response) {
  // on verifie que l'email et le password sont fournis dans le bon format
  const email = String(req.body.email).trim().toLowerCase();
  const password = String(req.body.password);

  try {
    // Creation de la requette SQL pour recuperer l'utilisateur par email
    const result = await query<DbUser>(
      `SELECT id, email, password_hash, display_name, is_active
      FROM users
      WHERE email = $1
      LIMIT 1`,
      [email],
    );
    const user = result[0];

    // on verifie que l'utilisateur existe
    userExists(user);

    // on verifie que le mot de passe est correct
    passwordIsValid(password, user.password_hash);

    //TODO expliquer
    const refreshToken = crypto.randomBytes(64).toString("hex");
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + ms(envToStringValue("REFRESH_TOKEN_EXPIRES_IN")),
    );

    await query(
      `INSERT INTO sessions (user_id, refresh_token_hash, expires_at) VALUES ($1, $2, $3)`,
      [user.id, refreshTokenHash, expiresAt],
    );

    // générer un jwt pour le accessToken
    const accessToken = initToken(
      user,
      "JWT_ACCESS_SECRET",
      "JWT_ACCESS_EXPIRES_IN",
    );

    const accessCookie = serializeCookie(
      "COOKIE_ACCESS_TOKEN_NAME",
      "COOKIE_ACCESS_TOKEN_SECURE",
      "COOKIE_ACCESS_TOKEN_SAME_SITE",
      accessToken,
      "JWT_ACCESS_EXPIRES_IN",
    );

    const refreshCookie = serializeCookie(
      "COOKIE_REFRESH_TOKEN_NAME",
      "COOKIE_REFRESH_TOKEN_SECURE",
      "COOKIE_REFRESH_TOKEN_SAME_SITE",
      refreshToken,
      "REFRESH_TOKEN_EXPIRES_IN",
    );

    // ajout du cookie dans le header de la reponse
    res.setHeader("Set-Cookie", [accessCookie, refreshCookie]);

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
