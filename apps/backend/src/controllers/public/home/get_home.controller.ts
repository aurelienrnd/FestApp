import type { Request, Response } from "express";

import { query } from "../../../db.js";
import type { ArtistItem, NewsItem } from "../../../type.js";

/** Retourne les 2 artistes les plus recents et les 2 dernieres news publiees pour la page d'accueil.
 * @function query
 */
export async function getHome(_req: Request, res: Response) {
  // Récupère en parallèle les artistes mis en avant et les 2 dernières news publiées.
  const [artists, news] = await Promise.all([
    query<
      Pick<
        ArtistItem,
        | "id"
        | "name"
        | "stage"
        | "start_time"
        | "end_time"
        | "url_media"
        | "description_media"
      >
    >(
      `SELECT a.id, a.name, a.url_media, a.description_media,
              c.stage, c.start_time, c.end_time
       FROM artists a
       LEFT JOIN concerts c ON c.artist_id = a.id
       WHERE a.is_featured = TRUE`,
    ),
    query<
      Pick<
        NewsItem,
        "id" | "title" | "url_media" | "description_media" | "created_at"
      >
    >(
      `SELECT id, title, url_media, description_media, created_at
       FROM news
       WHERE is_published = TRUE
       ORDER BY created_at DESC
       LIMIT 2`,
    ),
  ]);

  return res.status(200).json({ artists, news });
}
