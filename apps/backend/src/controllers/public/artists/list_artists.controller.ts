import type { Request, Response } from "express";

import { query } from "../../../db";
import type { ArtistItem } from "../../../type";

/** Liste la programmation (artistes) avec leur concert associe si existant. */
export async function listArtists(_req: Request, res: Response) {
  const artists = await query<
    Omit<
      ArtistItem,
      "bio" | "genre" | "origin" | "youtube_url" | "spotify_url" | "end_time"
    >
  >(
    `SELECT a.id, a.name, a.url_media, a.description_media, a.is_featured,
            c.stage, c.start_time
     FROM artists a
     LEFT JOIN concerts c ON c.artist_id = a.id
     ORDER BY a.name ASC`,
  );

  return res.status(200).json({ artists });
}
