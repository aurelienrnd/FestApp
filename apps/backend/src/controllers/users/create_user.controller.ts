import type { Request, Response } from "express";
import { query } from "../../db";

async function existingEmail(email: string) {
  const existingEmail = await query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existingEmail.length > 0) {
    throw new Error("Email déjà utilisé");
  }
}

async function existingDisplayName(email: string) {
  const existingEmail = await query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existingEmail.length > 0) {
    throw new Error("Nom déjà utilisé");
  }
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, display_name } = req.body;

    // Vérifier si l'email de l'utilisateur existe déjà
    await existingEmail(email);
    // Vérifier si le nom d'utilisateur existe déjà
    await existingDisplayName(email);

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
