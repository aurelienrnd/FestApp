import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { query } from "../db";
import { AppError } from "../errors/AppError";
import { ERRORS } from "../errors/errorMessages";
import type { IdRow } from "../type";

/** Genere un mot de passe temporaire aleatoire de 16 caracteres hexadecimaux. */
export function generateTemporaryPassword(): string {
  return randomBytes(8).toString("hex");
}

/** Hash un mot de passe en clair avec bcrypt (cout 10).
 * @param password mot de passe en clair a hasher
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/** Verifie que l'email n'est pas deja utilise par un autre utilisateur.
 * Si excludeId est fourni, l'utilisateur correspondant est ignore (cas de la modification).
 * @param email adresse email a verifier
 * @param excludeId id de l'utilisateur a exclure de la verification (optionnel)
 */
export async function checkEmailAvailable(
  email: string,
  excludeId?: string,
): Promise<void> {
  const users = excludeId
    ? await query<IdRow>(
        "SELECT id FROM users WHERE email = $1 AND id <> $2 LIMIT 1",
        [email, excludeId],
      )
    : await query<IdRow>("SELECT id FROM users WHERE email = $1 LIMIT 1", [
        email,
      ]);
  if (users.length > 0) {
    throw new AppError(ERRORS.USER_EMAIL_ALREADY_USED, 409);
  }
}

/** Verifie que le nom d'affichage n'est pas deja utilise par un autre utilisateur.
 * Si excludeId est fourni, l'utilisateur correspondant est ignore (cas de la modification).
 * @param displayName nom d'affichage a verifier
 * @param excludeId id de l'utilisateur a exclure de la verification (optionnel)
 */
export async function checkDisplayNameAvailable(
  displayName: string,
  excludeId?: string,
): Promise<void> {
  const users = excludeId
    ? await query<IdRow>(
        "SELECT id FROM users WHERE display_name = $1 AND id <> $2 LIMIT 1",
        [displayName, excludeId],
      )
    : await query<IdRow>(
        "SELECT id FROM users WHERE display_name = $1 LIMIT 1",
        [displayName],
      );
  if (users.length > 0) {
    throw new AppError(ERRORS.USER_DISPLAY_NAME_ALREADY_USED, 409);
  }
}

/** Verifie que l'utilisateur existe dans la base de donnees.
 * @param userId id de l'utilisateur a verifier
 */
export async function checkUserExists(userId: string): Promise<void> {
  const users = await query<IdRow>(
    "SELECT id FROM users WHERE id = $1 LIMIT 1",
    [userId],
  );
  if (users.length === 0) {
    throw new AppError(ERRORS.USER_NOT_FOUND, 404);
  }
}
