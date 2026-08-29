import type { Request, Response } from "express";
import { query } from "../../../db.js";
import { AppError } from "../../../errors/AppError.js";
import { ERRORS } from "../../../errors/errorMessages.js";
import { sendWelcomeEmail } from "../../../services/mailer.service.js";
import {
  checkEmailAvailable,
  checkDisplayNameAvailable,
  generateTemporaryPassword,
  hashPassword,
} from "../../../services/user.service.js";
import type { UserItem } from "../../../type.js";

/** Creation d'un utilisateur dans le service.
 * Verifie que l'email n'est pas deja utilise dans la BDD,
 * verifie que le display_name n'est pas deja utilise dans la BDD,
 * puis renvoie l'utilisateur cree.
 * @function checkEmailAvailable
 * @function checkDisplayNameAvailable
 * @function generateTemporaryPassword
 * @function hashPassword
 */
export const createUser = async (req: Request, res: Response) => {
  // Recupere les informations de l'utilisateur dans le body de la requete et cree un display name
  const { email, first_name, last_name, role } = req.body;
  const displayName = `${first_name} ${last_name}`.trim();

  // Verifie si l'email ou le display name est deja utilise
  await checkEmailAvailable(email);
  await checkDisplayNameAvailable(displayName);

  // Cree un mot de passe temporaire et le hash
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  // Enregistre l'utilisateur en base de donnees et le recupere
  const createdUsers = await query<UserItem>(
    `INSERT INTO users (
      email,
      password_hash,
      display_name,
      role
    ) VALUES ($1, $2, $3, $4)
     RETURNING id, email, display_name, role, created_at, password_changed_at`,
    [email, passwordHash, displayName, role],
  );
  const createdUser = createdUsers[0];
  if (!createdUser) {
    throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);
  }

  // envoie l'email
  await sendWelcomeEmail(email, displayName, temporaryPassword);

  return res.status(201).json({
    message: "Utilisateur cree",
    user: {
      id: createdUser.id,
      email: createdUser.email,
      display_name: createdUser.display_name,
      role: createdUser.role,
      created_at: createdUser.created_at,
      password_changed_at: createdUser.password_changed_at,
    },
  });
};
