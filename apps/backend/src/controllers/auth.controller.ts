import type { Request, Response } from "express";
import { query } from "../db";
import {
  userExists,
  passwordIsValid,
  initToken,
  serializeCookie,
} from "../functions";
import type { DbUser } from "../type.ts";

// NOTE Test de connexion à la base de données, a supprimer plus tard.
export const testGetUsers = async (req: Request, res: Response) => {
  try {
    const rows = await query("SELECT id, email, display_name FROM users");
    console.log("status : ok", rows);
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erreur connexion base de données",
    });
  }
};

// NOTE Création d'un utilisateur, a deplacer plus tard.
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, display_name } = req.body;

    // Vérifier si l'email de l'utilisateur existe déjà
    const existingEmail = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existingEmail.length > 0) {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    // Vérifier si le nom d'utilisateur existe déjà
    const existingDisplayName = await query(
      "SELECT id FROM users WHERE display_name = $1",
      [display_name],
    );
    if (existingDisplayName.length > 0) {
      return res.status(409).json({ error: "Nom d'utilisateur déjà utilisé" });
    }

    // Insertion de l'utilisateur dans la base de données
    const row = await query(
      `INSERT INTO users (email, password_hash, display_name, must_change_password, is_active)
       VALUES ($1, $2, $3, TRUE, TRUE)
       RETURNING id, email, display_name, is_active, must_change_password, created_at, updated_at`,
      [email, password, display_name],
    );

    return res.status(201).json({ message: "Utilisateur créé", user: row[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erreur lors de la création de l'utilisateur",
    });
  }
};

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
    console.log("user exists");

    // on verifie que le mot de passe est correct
    passwordIsValid(password, user.password_hash);
    console.log("password is valid");

    // creation du refrechToken

    // ash du refrechToken

    //INSERT INTO sessions (refresh_token_hash, expires_at, ...)

    // creation du accessToken
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
      60 * 60, // 1h
    );

    /*const refreshCookie = serializeCookie(
      "COOKIE_REFRESH_TOKEN_NAME",
      "COOKIE_REFRESH_TOKEN_SECURE",
      "COOKIE_REFRESH_TOKEN_SAME_SITE",
      refreshToken,
      7 * 24 * 60 * 60, // 7 jours
    );*/

    // ajout du cookie dans le header de la reponse
    res.setHeader("Set-Cookie", [accessCookie]);

    // reponse avec les informations de l'utilisateur
    return res.status(200).json({
      message: "Authentification réussie",
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        isActive: user.is_active,
      },
    });
  } catch (error: any) {
    console.error(error);
    return res
      .status(error.status || 401)
      .json({ error: error.message || "Internal Server Error" });
  }
}
