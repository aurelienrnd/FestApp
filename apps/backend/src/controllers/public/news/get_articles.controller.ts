import type { Request, Response } from "express";
import { query } from "../../../db";
import type { ArticleSummaryRow } from "../../../type";

/** Retourne la liste des articles tries par date de creation decroissante.
 * Si l'utilisateur est authentifie avec le role "admin" ou "news", retourne tous les articles.
 * Sinon, retourne uniquement les articles publies (is_published = TRUE).
 * L'auteur est recupere via LEFT JOIN users (null si l'utilisateur a ete supprime).
 * @param {Request} _req requete Express (non utilisee)
 * @param {Response} res reponse Express
 */
export async function getArticles(_req: Request, res: Response) {
  const isPrivileged =
    res.locals.userRole === "admin" || res.locals.userRole === "news";

  const articles = await query<ArticleSummaryRow>(
    `SELECT a.id, a.title, a.is_published, a.created_at,
            a.url_media, a.description_media, a.user_id,
            u.display_name AS author_name
     FROM articles a
     LEFT JOIN users u ON u.id = a.user_id
     ${isPrivileged ? "" : "WHERE a.is_published = TRUE"}
     ORDER BY a.created_at DESC`,
  );

  return res.status(200).json({ articles });
}
