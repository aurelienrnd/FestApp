import type { Request, Response } from "express";

import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";
import { requireUserId } from "../../../functions";

type UserInfoRow = {
  id: string;
  email: string;
  display_name: string;
  role: string;
};

/** Recupere les informations de l'utilisateur connecte
 * Verifie que l'utilisateur est present dans le header
 * Recupere le user en base de donnees
 * Renvoie les informations utilisateur et mustChangePassword
 */
export async function userInfo(_req: Request, res: Response) {
  // Récupère l'userId depuis `res.locals`puis recherche l'utilisateur dnas la bdd,
  const reqUserId = requireUserId(res.locals.userId);
  const rows = await query<UserInfoRow>(
    `SELECT id, email, display_name, role
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
  });
}
