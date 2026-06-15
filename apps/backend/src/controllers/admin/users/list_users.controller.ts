import type { Request, Response } from "express";
import { query } from "../../../db";
import type { UserItem } from "../../../type";

/** Liste tous les utilisateurs.
 * Renvoie uniquement les champs utiles au front (pas de champs sensibles).
 * @function query
 */
export async function listUsers(_req: Request, res: Response) {
  const users = await query<UserItem>(
    `SELECT id, email, display_name, role, created_at, password_changed_at
     FROM users
     ORDER BY display_name ASC`,
  );

  return res.status(200).json({ users });
}
