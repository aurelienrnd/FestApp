import type { Request, Response } from "express";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";
import { sendPasswordResetEmail } from "../../../services/mailer.service";
import {
  generateTemporaryPassword,
  hashPassword,
} from "../../../services/user.service";

/** Reinitialise le mot de passe d'un utilisateur a partir de son email.
 * Verifie que l'email existe en base, genere un mot de passe temporaire,
 * met a jour le hash et remet password_changed_at a null,
 * puis envoie le nouveau mot de passe par email.
 */
export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body as { email: string };

  // Verifie que l'email correspond a un utilisateur existant
  const rows = await query<{ id: string; email: string; display_name: string }>(
    `SELECT id, email, display_name FROM users WHERE email = $1 LIMIT 1`,
    [email],
  );
  const user = rows[0];
  if (!user) {
    throw new AppError(ERRORS.AUTH_EMAIL_NOT_FOUND, 404);
  }

  // Genere un mot de passe temporaire et le hash
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  // Met a jour le hash et remet password_changed_at a null pour forcer le changement
  await query(
    `UPDATE users SET password_hash = $1, password_changed_at = NULL WHERE id = $2`,
    [passwordHash, user.id],
  );

  await sendPasswordResetEmail(
    user.email,
    user.display_name,
    temporaryPassword,
  );

  return res
    .status(200)
    .json({ message: "Nouveau mot de passe envoye par email" });
}
