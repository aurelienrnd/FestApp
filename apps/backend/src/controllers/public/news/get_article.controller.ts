import type { Request, Response } from "express";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";
import type { ArticleItem } from "../../../type";

/** Retourne un article par son identifiant.
 * Si l'utilisateur est authentifie avec le role "admin" ou "news", retourne l'article meme s'il est en brouillon.
 * Sinon, retourne l'article uniquement s'il est publie (is_published = TRUE).
 * Leve une AppError 404 si l'article n'existe pas ou n'est pas accessible.
 * @param {Request} req requete Express — `req.params.id` contient l'UUID de l'article
 * @param {Response} res reponse Express
 */
export async function getArticle(req: Request, res: Response) {
  const { id } = req.params;
  const isPrivileged =
    res.locals.userRole === "admin" || res.locals.userRole === "news";

  const rows = await query<ArticleItem>(
    `SELECT a.id, a.title, a.content, a.is_published, a.created_at,
            a.url_media, a.description_media, a.user_id,
            u.display_name AS author_name
     FROM articles a
     LEFT JOIN users u ON u.id = a.user_id
     WHERE a.id = $1`,
    [id],
  );

  if (!rows[0]) throw new AppError(ERRORS.ARTICLE_NOT_FOUND, 404);

  if (!isPrivileged && !rows[0].is_published)
    throw new AppError(ERRORS.ARTICLE_NOT_FOUND, 404);

  return res.status(200).json({ article: rows[0] });
}
