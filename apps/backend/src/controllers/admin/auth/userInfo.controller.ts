import type { Request, Response } from "express";

import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";

type UserInfoRow = {
  id: string;
  email: string;
  display_name: string;
  is_active: boolean;
  role: string;
  must_change_password: boolean;
};

/** Recupere les informations de l'utilisateur connecte
 * Verifie que l'utilisateur est present dans le header
 * Recupere le user en base de donnees
 * Renvoie les informations utilisateur et mustChangePassword
 */
export async function userInfo(req: Request, res: Response) {
  try {
    const reqUserId = req.headers.userId;
    if (!reqUserId) {
      throw new AppError("Missing user", 401);
    }

    const rows = await query<UserInfoRow>(
      `SELECT id, email, display_name, is_active, role, must_change_password
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [reqUserId],
    );
    const user = rows[0];
    if (!user) {
      throw new AppError("User not found", 401);
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        is_active: user.is_active,
        role: user.role,
      },
      mustChangePassword: user.must_change_password,
    });
  } catch (error) {
    console.error(error);
    const err = error instanceof Error ? error : new Error("Cannot load user");
    const status =
      typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : 401;
    return res.status(status).json({ error: err.message });
  }
}
