import type { Request, Response } from "express";

import { query } from "../../../db";
import type { HomeArtistRow, HomeArticleRow } from "../../../type";

/** Retourne les 2 artistes les plus recents et les 2 derniers articles publies pour la page d'accueil. */
export async function getHomeController(_req: Request, res: Response) {
  const [artists, articles] = await Promise.all([
    query<HomeArtistRow>(
      `SELECT a.id, a.name, a.url_media, a.description_media,
              c.stage, c.start_time, c.end_time
       FROM artists a
       LEFT JOIN concerts c ON c.artist_id = a.id
       WHERE c.start_time IS NOT NULL
       ORDER BY c.start_time DESC
       LIMIT 2`,
    ),
    query<HomeArticleRow>(
      `SELECT id, title, url_media, description_media, created_at
       FROM articles
       WHERE is_published = TRUE
       ORDER BY created_at DESC
       LIMIT 2`,
    ),
  ]);

  return res.status(200).json({ artists, articles });
}
