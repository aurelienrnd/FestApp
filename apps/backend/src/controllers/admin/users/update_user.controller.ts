import type { Request, Response } from "express";
import { query } from "../../../db.js";
import { AppError } from "../../../errors/AppError.js";
import { ERRORS } from "../../../errors/errorMessages.js";
import {
  checkUserExists,
  checkEmailAvailable,
  checkDisplayNameAvailable,
} from "../../../services/user.service.js";
import type { UserItem } from "../../../type.js";

/** Modification d'un utilisateur dans le service
 * Met a jour les informations de l'utilisateur
 * @function checkUserExists
 * @function checkEmailAvailable
 * @function checkDisplayNameAvailable
 * @function query
 */
export async function updateUser(req: Request, res: Response) {
  // Recupere les informations de l'utilisateur dans le body de la requete et cree un display name
  const { email, first_name, last_name, role } = req.body;
  const userId = req.params.id;
  const displayName = `${first_name} ${last_name}`.trim();

  // Verifie si l'utilisateur existe et si l'email ou le display name sont deja utilises
  await checkUserExists(userId);
  await checkEmailAvailable(email, userId);
  await checkDisplayNameAvailable(displayName, userId);

  // Met a jour l'utilisateur en base de donnees et le recupere
  const updatedUsers = await query<UserItem>(
    `UPDATE users
     SET email = $1, display_name = $2, role = $3
     WHERE id = $4
     RETURNING id, email, display_name, role, created_at, password_changed_at`,
    [email, displayName, role, userId],
  );
  const updatedUser = updatedUsers[0];
  if (!updatedUser) {
    throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);
  }

  return res.status(200).json({
    message: "Utilisateur modifie",
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      display_name: updatedUser.display_name,
      role: updatedUser.role,
      created_at: updatedUser.created_at,
      password_changed_at: updatedUser.password_changed_at,
    },
  });
}
