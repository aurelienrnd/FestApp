import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { AppError } from "../errors/AppError.js";
import { ERRORS } from "../errors/errorMessages.js";

/** Retourne un middleware Express pour hasher le mot de passe dans req.body.
 * Si le champ du mot de passe n'existe pas ou n'est pas une chaîne, renvoie une erreur 400.
 * L'utilisation du middleware dans une fonction permet d'utiliser différent Field pour l'adapter a d'autres types de requêtes exemple password et newPassword.
 * @param passWordField Le nom du champ du mot de passe dans req.body
 * @returns Middleware Express qui hache le mot de passe dans req.body[passWordField].
 */
export function hashPassword(field = "password") {
  return async function (req: Request, res: Response, next: NextFunction) {
    // verifie que le mot de passe existe et est bien une chaine de caractere
    const password = req.body?.[field];
    if (typeof password !== "string") {
      throw new AppError(ERRORS.PASSWORD_INVALID_FORMAT, 400);
    }

    // hache le mot de passe avec bcrypt et le remplace dans req.body
    const hashed = await bcrypt.hash(password, 10);
    req.body[field] = hashed;

    next();
  };
}
