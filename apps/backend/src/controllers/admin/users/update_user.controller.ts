import type { Request, Response } from "express";
import { z } from "zod";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";
import type { UserListRow } from "../../../type";

/** Verifie que l'utilisateur existe dans la BDD via son id
 * @param {string} userId id de l'utilisateur dans les parametres de la requete
 */
async function userExists(userId: string) {
  const users = await query<{ id: string }>(
    "SELECT id FROM users WHERE id = $1 LIMIT 1",
    [userId],
  );
  if (users.length === 0) {
    throw new AppError(ERRORS.USER_NOT_FOUND, 404);
  }
}

/** Verifie que l'email n'est pas deja utilise par un autre utilisateur
 * @param {string} email email de l'utilisateur dans le body de la requete
 * @param {string} userId id de l'utilisateur en cours de modification
 */
async function existingEmail(email: string, userId: string) {
  const users = await query<{ id: string }>(
    "SELECT id FROM users WHERE email = $1 AND id <> $2 LIMIT 1",
    [email, userId],
  );
  if (users.length > 0) {
    throw new AppError(ERRORS.USER_EMAIL_ALREADY_USED, 409);
  }
}

/** Verifie que le nom d'utilisateur n'est pas deja utilise par un autre utilisateur
 * @param {string} displayName nom complet de l'utilisateur dans le body de la requete
 * @param {string} userId id de l'utilisateur en cours de modification
 */
async function existingDisplayName(displayName: string, userId: string) {
  const users = await query<{ id: string }>(
    "SELECT id FROM users WHERE display_name = $1 AND id <> $2 LIMIT 1",
    [displayName, userId],
  );
  if (users.length > 0) {
    throw new AppError(ERRORS.USER_DISPLAY_NAME_ALREADY_USED, 409);
  }
}

/** Modification d'un utilisateur dans le service
 * Met a jour les informations de l'utilisateur
 * @function userExists
 * @function existingEmail
 * @function existingDisplayName
 */
export async function updateUser(req: Request, res: Response) {
  // Definit un schema Zod pour valider les parametres, en exigeant un identifiant au format UUID
  const paramsSchema = z.object({
    id: z.uuid(),
  });

  // Valide les parametres de la requete et lance une erreur si la validation echoue
  const parsedParams = paramsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    throw new AppError(ERRORS.VALIDATION_INVALID_BODY, 400);
  }

  // Recupere les informations de l'utilisateur dans le body de la requete et cree un display name
  const { email, first_name, last_name, role } = req.body;
  const userId = parsedParams.data.id;
  const displayName = `${first_name} ${last_name}`.trim();

  // Verifie si l'utilisateur existe et si l'email ou le display name sont deja utilises
  await userExists(userId);
  await existingEmail(email, userId);
  await existingDisplayName(displayName, userId);

  // Met a jour l'utilisateur en base de donnees et le recupaire
  const updatedUsers = await query<UserListRow>(
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
