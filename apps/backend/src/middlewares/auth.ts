// Middleware pour authentifier l'utilisateur via son token
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { getEnv } from "../functions";
import type { JwtPayload } from "jsonwebtoken";
import { query } from "../db";

/** Verifie qu'un token est present dans le cookie de la requete
 * @return le token
 */
function getTokenFromCookie(req: Request) {
  if (!req.headers.cookie) {
    throw new Error("missing cookie");
  }

  const cookies = parse(req.headers.cookie);
  const cookieName = getEnv("COOKIE_ACCESS_TOKEN_NAME");
  const token = cookies[cookieName];

  if (!token) {
    throw new Error("missing access token");
  }

  return token;
}

/** Decode le token JWT pour recuperer le userId et le sessionId
 * @return le userId et le sessionId
 */
function decodedToken(token: string) {
  const decodedToken = jwt.verify(
    token,
    getEnv("JWT_ACCESS_SECRET"),
  ) as JwtPayload;
  const userId = decodedToken.userId;
  const sessionId = decodedToken.sessionId;
  return { userId, sessionId };
}

/** Verifie que l'utilisateur est autorise a effectuer cette requete
 * Recupere et decode le token
 * Recherche l'utilisateur dans la BDD
 * Renvoie le user et le sessionId dans le header de la requete
 */
export async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getTokenFromCookie(req);
    const { userId, sessionId } = decodedToken(token);

    const user = await query(
      "SELECT id, display_name FROM users WHERE id = $1",
      [userId],
    );
    if (!user[0]) {
      throw new Error("User not found");
    }

    req.headers.userId = user[0].id;
    req.headers.userdisplayName = user[0].display_name;
    req.headers.session = sessionId;

    next();
  } catch (error) {
    console.error(error);
    const err = error instanceof Error ? error : new Error("Not authorized");
    const status =
      typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : 401;
    return res.status(status).json({ error: err.message });
  }
}
