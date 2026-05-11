import type { Request, Response } from "express";
import { query } from "../../../db";
import type { NewsItem } from "../../../type";

/** Retourne la liste des news triees par date de creation decroissante.
 * Si l'utilisateur est authentifie avec le role "admin" ou "news", retourne toutes les news.
 * Sinon, retourne uniquement les news publiees (is_published = TRUE).
 * L'auteur est recupere via LEFT JOIN users (null si l'utilisateur a ete supprime).
 * @param {Request} _req requete Express (non utilisee)
 * @param {Response} res reponse Express
 */
export async function getNewsList(_req: Request, res: Response) {
  const isPrivileged =
    res.locals.userRole === "admin" || res.locals.userRole === "news";

  const news = await query<Omit<NewsItem, "content" | "user_id">>(
    `SELECT a.id, a.title, a.is_published, a.created_at,
            a.url_media, a.description_media,
            u.display_name AS author_name
     FROM news a
     LEFT JOIN users u ON u.id = a.user_id
     ${isPrivileged ? "" : "WHERE a.is_published = TRUE"}
     ORDER BY a.created_at DESC`,
  );

  return res.status(200).json({ news });
}
