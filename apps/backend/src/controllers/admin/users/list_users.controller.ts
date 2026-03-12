import type { Request, Response } from "express";

import { query } from "../../../db";

type UserListRow = {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  must_change_password: boolean;
  created_at: string;
  password_changed_at: string | null;
};

/** Liste tous les utilisateurs.
 * Renvoie uniquement les champs utiles au front (pas de champs sensibles).
 */
export async function listUsers(_req: Request, res: Response) {
  const users = await query<UserListRow>(
    `SELECT id, email, display_name, role, must_change_password, created_at, password_changed_at
     FROM users
     ORDER BY display_name ASC`,
  );

  return res.status(200).json({ users });
}
