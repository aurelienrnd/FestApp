import type { Request, Response } from "express";
import type { SessionRow } from "../../../type";

import {
  requireSessionId,
  requireUserId,
  sessionExists,
  sessionRevoked,
} from "../../../functions";
import { query } from "../../../db";

/** Deconnecte l'utilisateur du service
 * Verifie que la session existe
 * Verifie que la session n'est pas deja revoquee
 * Revoque la session dans la BDD
 */
export async function logout(_req: Request, res: Response) {
  const reqSessionId = requireSessionId(res.locals.sessionId);
  const reqUserId = requireUserId(res.locals.userId);

  const rows = await query<SessionRow>(
    "SELECT id, revoked_at, expires_at FROM sessions WHERE id = $1 AND user_id = $2",
    [reqSessionId, reqUserId],
  );
  const sessionBdd: SessionRow = rows[0];

  sessionExists(sessionBdd);
  sessionRevoked(sessionBdd);

  await query(
    "UPDATE sessions SET revoked_at = now() WHERE id = $1 AND user_id = $2 RETURNING id",
    [reqSessionId, reqUserId],
  );

  return res.status(200).json({ message: "Deconnexion reussie" });
}
