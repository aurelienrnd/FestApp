// Midellware pour valider le corps de la requête via un schéma
import type { Request, Response, NextFunction } from "express";
import * as z from "zod";

/** Retourne un middleware Express qui valide req.body.
 * Si la validation échoue, une réponse 400 est renvoyée avec les détails de l'erreur.
 * L'utilisation du middleware dans une fonction permet d'utiliser différent le schéma pour l'adapter a d'autres types de requêtes.
 * @param schema Schéma Zod pour valider le corps de la requête.
 * @returns Middleware Express avec les données validées.
 * @throws 400 si les données sont invalides.
 */
export function validateBody(schema: z.ZodTypeAny) {
  return function (req: Request, res: Response, next: NextFunction) {
    const result = schema.safeParse(req.body); // safeParse permet a zod de ne pas throw une erreur et renvoie un objet avec success true/false, evite try/catch
    if (!result.success) {
      return res.status(400).json({
        error: "Données invalides",
        details: result.error.issues,
      });
    }
    req.body = result.data;
    next();
  };
}
