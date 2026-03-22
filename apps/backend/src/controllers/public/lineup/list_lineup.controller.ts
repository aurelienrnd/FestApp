import type { Request, Response } from "express";

import { query } from "../../../db";
import type { ArtistListRow } from "../../../type";

/** Liste la programmation (artistes) avec leur concert associe si existant. */
export async function listLineup(_req: Request, res: Response) {
  const artists = await query<ArtistListRow>(
    `SELECT a.id, a.name, a.genre, a.origin, a.bio, a.url_media, a.description_media,
            c.stage, c.start_time, c.end_time
     FROM artists a
     LEFT JOIN concerts c ON c.artist_id = a.id
     ORDER BY a.name ASC`,
  );

  return res.status(200).json({ artists });
}
