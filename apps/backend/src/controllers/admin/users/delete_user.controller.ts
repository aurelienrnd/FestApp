import type { Request, Response } from "express";
import type { IdRow } from "../../../type";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";


/** Supprime definitivement un utilisateur par son identifiant. */
export async function deleteUser(req: Request, res: Response) {
  // Supprime l’utilisateur correspondant a l’id fourni, si aucun utilisateur n’a ete supprime, retourne une erreur 404
  const deletedUsers = await query<IdRow>(
    "DELETE FROM users WHERE id = $1 RETURNING id",
    [req.params.id],
  );
  if (!deletedUsers[0]) {
    throw new AppError(ERRORS.USER_NOT_FOUND, 404);
  }

  return res.status(200).json({ message: "Utilisateur supprime" });
}
