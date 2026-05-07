import type { Request, Response } from "express";
import type { IdRow } from "../../../type";
import { z } from "zod";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";

/** Supprime definitivement un utilisateur par son identifiant. */
export async function deleteUser(req: Request, res: Response) {
  // Définit un schéma Zod pour valider les paramètres, en exigeant un identifiant au format UUID
  const paramsSchema = z.object({
    id: z.uuid(),
  });

  // Valide les paramètres de la requête et Lance une erreur si la validation échoue
  const parsedParams = paramsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    throw new AppError(ERRORS.VALIDATION_INVALID_BODY, 400);
  }

  // Supprime l’utilisateur correspondant à l’id fourni, si aucun utilisateur n’a été supprimé, retourne une erreur 404
  const deletedUsers = await query<IdRow>(
    "DELETE FROM users WHERE id = $1 RETURNING id",
    [parsedParams.data.id],
  );
  if (deletedUsers.length === 0) {
    throw new AppError(ERRORS.USER_NOT_FOUND, 404);
  }

  return res.status(200).json({ message: "Utilisateur supprime" });
}
