import type { Request, Response } from "express";
import { query } from "../../db";

/** Verifie que l'email de l'utilsateur existe dans la BDD
 * @param {string} email email de l'utilsateur dans le body de la requete
 */
async function existingEmail(email: string) {
  const existingEmail = await query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existingEmail.length > 0) {
    throw new Error("Email déjà utilisé");
  }
}

/** Verifie que l'email de l'utilsateur existe dans la BDD
 * @param {string} display_name nom de l'utilisateur dans le boddy de la requete
 */
async function existingDisplayName(display_name: string) {
  const existingEmail = await query("SELECT id FROM users WHERE email = $1", [
    display_name,
  ]);
  if (existingEmail.length > 0) {
    throw new Error("Nom déjà utilisé");
  }
}

/** Creation d'un utilisateur dans le service
 * Verifie si email n'est pas deja utilisé dans la BDD
 * Vérifie si le display_name n'est pas utilisé dans la BDD
 * Renvoie utilisateur crées
 * @function existingEmail Verifie que l'email de l'utilsateur existe dans la BDD
 * @function existingDisplayName Verifie que l'email de l'utilsateur existe dans la BDD
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, display_name } = req.body;
    // Vérifier si l'email de l'utilisateur existe déjà
    await existingEmail(email);
    // Vérifier si le nom d'utilisateur existe déjà
    await existingDisplayName(display_name);

    // Insertion de l'utilisateur dans la base de données
    const row = await query(
      `INSERT INTO users (email, password_hash, display_name, must_change_password, is_active)
       VALUES ($1, $2, $3, TRUE, TRUE)
       RETURNING id, email, display_name, is_active, must_change_password, created_at, updated_at`,
      [email, password, display_name],
    );

    return res.status(201).json({ message: "Utilisateur créé" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Erreur lors de la création de l'utilisateur",
    });
  }
};
