// Import type
import type { Request, Response } from "express";
import type { SessionRow } from "../../../type";

// Import module
import { query } from "../../../db";

// Import fonctions
import { sessionExists, sessionRevoked } from "../../../functions";

/** Deconnecte l'utilisateur du service
 * Verifie si la session existe
 * Verifie si la session n'est pas deja revoquee
 * Revoque la session dans la BDD
 * @function sessionExists Teste si la session existe
 * @function sessionRevoked Verifie si la session est deja revoquee
 */
export async function logout(req: Request, res: Response) {
  try {
    // recupere l'id de la session et de l'utilisateur depuis les headers puis verifie qu'ils existent
    const reqSessionId = req.headers.session;
    const reqUserId = req.headers.userId;
    if (!reqSessionId || !reqUserId) {
      const err = new Error("Missing session");
      (err as { status?: number }).status = 401;
      throw err;
    }

    // recupere la session dans la BDD
    const rows = await query<SessionRow>(
      "SELECT id, revoked_at, expires_at FROM sessions WHERE id = $1 AND user_id = $2",
      [reqSessionId, reqUserId],
    );
    const sessionBdd: SessionRow = rows[0];

    // verifie si la session existe et n'est pas deja revoquee
    sessionExists(sessionBdd);
    sessionRevoked(sessionBdd);

    // revoque la session dans la BDD
    await query(
      "UPDATE sessions SET revoked_at = now() WHERE id = $1 AND user_id = $2 RETURNING id",
      [reqSessionId, reqUserId],
    );

    return res.status(200).json({ message: "Deconnexion reussie" });
  } catch (error) {
    console.error(error);
    const err = error instanceof Error ? error : new Error("Logout failed");
    const status =
      typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : 401;
    return res.status(status).json({ error: err.message });
  }
}
