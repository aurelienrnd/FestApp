import type { Request, Response } from "express";
import { query } from "../../../db.js";
import { AppError } from "../../../errors/AppError.js";
import { ERRORS } from "../../../errors/errorMessages.js";
import { isNewsPrivileged } from "../../../services/user.service.js";
import type { NewsItem } from "../../../type.js";

/** Retourne une news par son identifiant.
 * Si l'utilisateur est authentifie avec le role "admin" ou "news", retourne la news meme si elle est en brouillon.
 * Sinon, retourne la news uniquement si elle est publiee (is_published = TRUE).
 * Leve une AppError 404 si la news n'existe pas ou n'est pas accessible.
 * @param {Request} req requete Express — `req.params.id` contient l'UUID de la news
 * @param {Response} res reponse Express
 * @function query
 */
export async function getNews(req: Request, res: Response) {
  // Extrait l'UUID et vérifie si l'utilisateur a accès aux brouillons.
  const { id } = req.params;
  const isPrivileged = isNewsPrivileged(res.locals.userRole);

  // Récupère la news complète avec le nom de l'auteur.
  const rows = await query<NewsItem>(
    `SELECT a.id, a.title, a.content, a.is_published, a.created_at,
            a.url_media, a.description_media,
            u.display_name AS author_name
     FROM news a
     LEFT JOIN users u ON u.id = a.user_id
     WHERE a.id = $1`,
    [id],
  );

  // Lève une 404 si introuvable, ou si brouillon non accessible par cet utilisateur.
  if (!rows[0]) throw new AppError(ERRORS.NEWS_NOT_FOUND, 404);
  if (!isPrivileged && !rows[0].is_published)
    throw new AppError(ERRORS.NEWS_NOT_FOUND, 404);

  return res.status(200).json({ news: rows[0] });
}
