import type { Request, Response } from "express";
import { query } from "../../../db";

/** Verifie que l'email de l'utilsateur existe dans la BDD
 * @param {string} email email de l'utilsateur dans le body de la requete
 */
async function existingEmail(email: string) {
  const existingEmail = await query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existingEmail.length > 0) {
    const err = new Error("Email deja utilise");
    (err as { status?: number }).status = 409;
    throw err;
  }
}

/** Verifie que le nom d'utilisateur existe dans la BDD
 * @param {string} display_name nom de l'utilisateur dans le boddy de la requete
 */
async function existingDisplayName(display_name: string) {
  const existingDisplayName = await query(
    "SELECT id FROM users WHERE display_name = $1",
    [display_name],
  );
  if (existingDisplayName.length > 0) {
    const err = new Error("Nom deja utilise");
    (err as { status?: number }).status = 409;
    throw err;
  }
}

/** Creation d'un utilisateur dans le service
 * Verifie si email n'est pas deja utilise dans la BDD
 * Verifie si le display_name n'est pas utilise dans la BDD
 * Renvoie utilisateur cree
 * @function existingEmail Verifie que l'email de l'utilisateur existe dans la BDD
 * @function existingDisplayName Verifie que le nom d'utilisateur existe dans la BDD
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, display_name } = req.body;
    // Verifier si l'email de l'utilisateur existe deja
    await existingEmail(email);
    // Verifier si le nom d'utilisateur existe deja
    await existingDisplayName(display_name);

    // Insertion de l'utilisateur dans la base de donnees
    await query(
      `INSERT INTO users (email, password_hash, display_name, must_change_password, is_active)
       VALUES ($1, $2, $3, TRUE, TRUE)
       RETURNING id, email, display_name, is_active, must_change_password, created_at`,
      [email, password, display_name],
    );

    return res.status(201).json({ message: "Utilisateur cree" });
  } catch (error) {
    console.error(error);
    const err =
      error instanceof Error
        ? error
        : new Error("Probleme lors de la creation de l'utilisateur");
    const status =
      typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : 500;
    return res.status(status).json({
      error: err.message,
    });
  }
};
