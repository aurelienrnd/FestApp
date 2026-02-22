import type { Request, Response } from "express";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";

/** Verifie que l'email de l'utilisateur existe dans la BDD
 * @param {string} email email de l'utilisateur dans le body de la requete
 */
async function existingEmail(email: string) {
  const existingEmail = await query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existingEmail.length > 0) {
    throw new AppError("Email déjà utilise", 409);
  }
}

/** Verifie que le nom d'utilisateur existe dans la BDD
 * @param {string} display_name nom de l'utilisateur dans le body de la requete
 */
async function existingDisplayName(display_name: string) {
  const existingDisplayName = await query(
    "SELECT id FROM users WHERE display_name = $1",
    [display_name],
  );
  if (existingDisplayName.length > 0) {
    throw new AppError("Nom déjà utilise", 409);
  }
}

/** Creation d'un utilisateur dans le service
 * Verifie que l'email n'est pas deja utilise dans la BDD
 * Verifie que le display_name n'est pas deja utilise dans la BDD
 * Renvoie l'utilisateur cree
 */
export const createUser = async (req: Request, res: Response) => {
  const { email, password, display_name } = req.body;
  await existingEmail(email);
  await existingDisplayName(display_name);

  await query(
    `INSERT INTO users (email, password_hash, display_name, must_change_password, is_active)
     VALUES ($1, $2, $3, TRUE, TRUE)
     RETURNING id, email, display_name, is_active, must_change_password, created_at`,
    [email, password, display_name],
  );

  return res.status(201).json({ message: "Utilisateur créé" });
};
