import type { Request, Response } from "express";
import { query } from "../../db";

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
