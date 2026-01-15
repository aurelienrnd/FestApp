// Middleware pour hasher le mot de passe
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

/** Retourne un middleware Express pour hasher le mot de passe dans req.body.
 * Si le champ du mot de passe n'existe pas ou n'est pas une chaîne, renvoie une erreur 400.
 * Si une erreur survient lors du hashage, renvoie une erreur 500.
 * L'utilisation du middleware dans une fonction permet d'utiliser différent Field pour l'adapter a d'autres types de requêtes exemple password et newPassword.
 * @param passWordField Le nom du champ du mot de passe dans req.body
 * @returns Middleware Express qui hache le mot de passe dans req.body[passWordField].
 * @throws 500 si une erreur survient lors du hashage.
 */
export function hashPassword(field = "password") {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      //NOTE Cette verif fait un peu doublon avec la validation Zod
      // verifie que le mot de passe existe et est bien une chaine de caractere
      const password = req.body?.[field];
      if (typeof password !== "string") {
        throw new Error("Mot de passe non conforme");
      }

      // hache le mot de passe avec bcrypt et le remplace dans req.body
      const hashed = await bcrypt.hash(password, 10);
      req.body[field] = hashed;

      return next();
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || "Erreur lors du hash du mot de passe",
      });
    }
  };
}
