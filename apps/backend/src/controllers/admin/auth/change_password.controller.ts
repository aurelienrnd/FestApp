import type { Request, Response } from "express";
import bcrypt from "bcrypt";

import { query } from "../../../db";
import { requireUserId } from "../../../utils";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";
import type { UserCredentialsRow } from "../../../type";

/** Modifie le mot de passe de l'utilisateur connecte.
 * Verifie que le mot de passe actuel est correct, puis met a jour password_hash et password_changed_at.
 * @param {Request} req requete Express — body contient password (texte clair) et newPassword (deja hashe par le middleware hashPassword)
 * @param {Response} res reponse Express — res.locals.userId contient l'id extrait du token
 */
export async function changePassword(req: Request, res: Response) {
  const userId = requireUserId(res.locals.userId);
  const { password, newPassword } = req.body as {
    password: string;
    newPassword: string;
  };

  // Recupere le hash actuel de l'utilisateur
  const rows = await query<UserCredentialsRow>(
    `SELECT id, email, password_hash, display_name
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [userId],
  );
  const user = rows[0];
  if (!user) {
    throw new AppError(ERRORS.AUTH_USER_NOT_FOUND, 404);
  }

  // Verifie que le mot de passe actuel correspond au hash en BDD
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new AppError(ERRORS.AUTH_WRONG_PASSWORD, 401);
  }

  // Met a jour le hash et la date de changement
  await query(
    `UPDATE users
     SET password_hash = $1, password_changed_at = NOW()
     WHERE id = $2`,
    [newPassword, userId],
  );

  return res.status(200).json({ message: "Mot de passe modifie" });
}
