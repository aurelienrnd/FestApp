// Middleware pour authentifier l'utilisateur via son token
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getEnv } from "../functions";
import type { JwtPayload } from "jsonwebtoken";
import { query } from "../db";

/** Vérifie qu'un token est bien présent dans le header de la requete
 * @return le token
 */
function emptyTokenTest(req: Request) {
  if (!req.headers.authorization) {
    throw new Error("missing authorization");
  }

  const token = req.headers.authorization.split(" ")[1];
  return token;
}

/** Decode le token JTW pour récupairer le userId et le sessionId
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

/** Vérifie que l'utilisateur est autorisé à effectué cette requete
 * Récupère et code le token
 * Recherche l'utilisateur dans la BDD
 * Renvoie le user et le sessionId dans le header de la requete
 * @function emptyTokenTest Vérifie qu'un token est bien présent dans le header de la requete
 * @function decodedToken Décode le token JTW pour récupérer le userId et le sessionId
 */
export async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    // Récupération du token et envoi d'une erreur si non trouvé
    const token = emptyTokenTest(req);

    // TODO -- À supprimer une fois les tests terminés
    console.log("Token recu dans le header:", token);

    // Décodage du token en userId
    const { userId, sessionId } = decodedToken(token);

    // Recherche du userId dans la base de données et envoi d'une erreur si l'utilisateur n'est pas trouvé
    const user = await query(
      "SELECT id, display_name FROM users WHERE id = $1",
      [userId],
    );
    if (!user[0]) {
      throw new Error("User not found");
    }

    // Si l'utilisateur est trouvé on renvoie le header et l'id de la session
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
