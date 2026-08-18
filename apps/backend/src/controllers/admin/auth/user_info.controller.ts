import type { Request, Response } from "express";

import { query } from "../../../db.js";
import { AppError } from "../../../errors/AppError.js";
import { ERRORS } from "../../../errors/errorMessages.js";
import { requireUserId } from "../../../utils.js";
import type { UserItem } from "../../../type.js";

/** Recupere les informations de l'utilisateur connecte
 * Verifie que l'utilisateur est present dans le header
 * Recupere le user en base de donnees
 * Renvoie les informations utilisateur et mustChangePassword
 * @function query
 * @function requireUserId
 */
export async function userInfo(_req: Request, res: Response) {
  // Récupère l'userId depuis `res.locals`puis recherche l'utilisateur dnas la bdd,
  const reqUserId = requireUserId(res.locals.userId);
  const rows = await query<Omit<UserItem, "created_at">>(
    `SELECT id, email, display_name, role, password_changed_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [reqUserId],
  );
  const user = rows[0];
  if (!user) {
    throw new AppError(ERRORS.AUTH_USER_NOT_FOUND, 401);
  }

  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
    },
    mustChangePassword: user.password_changed_at === null,
  });
}
