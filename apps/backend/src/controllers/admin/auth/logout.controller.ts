// Import type
import type { Request, Response } from "express";
import type { SessionRow } from "../../../type";

// Import module
import { query } from "../../../db";

// Import fonctions
import { sessionExists, sessionRevoked } from "../../../functions";

//TODO - A COMMENTER ET TESTER
export async function logout(req: Request, res: Response) {
  try {
    // Get session and user from headers
    const reqSessionId = req.headers.session;
    const reqUserId = req.headers.userId;
    if (!reqSessionId || !reqUserId) {
      const err = new Error("Missing session");
      (err as { status?: number }).status = 401;
      throw err;
    }

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
