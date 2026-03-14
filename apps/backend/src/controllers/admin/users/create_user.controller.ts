import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";

/** Verifie que l'email de l'utilisateur existe dans la BDD
 * @param {string} email email de l'utilisateur dans le body de la requete
 */
async function existingEmail(email: string) {
  const existingEmail = await query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existingEmail.length > 0) {
    throw new AppError(ERRORS.USER_EMAIL_ALREADY_USED, 409);
  }
}
/** Verifie que le nom d'utilisateur existe dans la BDD
 * @param {string} displayName nom complet de l'utilisateur dans le body de la requete
 */
async function existingDisplayName(displayName: string) {
  const existingDisplayName = await query(
    "SELECT id FROM users WHERE display_name = $1",
    [displayName],
  );
  if (existingDisplayName.length > 0) {
    throw new AppError(ERRORS.USER_DISPLAY_NAME_ALREADY_USED, 409);
  }
}

/** Cree un mot de passe temporaire aleatoire */
function generateTemporaryPassword() {
  return randomBytes(8).toString("hex");
}

/** Creation d'un utilisateur dans le service
 * Verifie que l'email n'est pas deja utilise dans la BDD
 * Verifie que le display_name n'est pas deja utilise dans la BDD
 * Renvoie l'utilisateur cree
 * @function existingEmail
 * @function existingDisplayName
 */
export const createUser = async (req: Request, res: Response) => {
  // Récupère les informations de l'utilisateur dans le body de la requête et crée un display name
  const { email, first_name, last_name, role } = req.body;
  const displayName = `${first_name} ${last_name}`.trim();

  // Vérifie si l'email ou le display name est déjà utilisé
  await existingEmail(email);
  await existingDisplayName(displayName);

  // Crée un mot de passe temporaire et le hash
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 10);

  // Enregistre l'utilisateur en base de données et le recupaire
  const createdUsers = await query<{
    id: string;
    email: string;
    display_name: string;
    role: string;
    created_at: string;
  }>(
    `INSERT INTO users (
      email,
      password_hash,
      display_name,
      role
    ) VALUES ($1, $2, $3, $4)
     RETURNING id, email, display_name, role, created_at`,
    [email, passwordHash, displayName, role],
  );
  const createdUser = createdUsers[0];

  return res.status(201).json({
    message: "Utilisateur cree",
    temporary_password: temporaryPassword,
    user: {
      id: createdUser.id,
      email: createdUser.email,
      display_name: createdUser.display_name,
      role: createdUser.role,
      created_at: createdUser.created_at,
    },
  });
};
