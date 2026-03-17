import type { Request, Response } from "express";

import { query } from "../../../db";
import type { ArtistListRow } from "../../../type";

/** Liste la programmation (artistes). */
export async function listLineup(_req: Request, res: Response) {
  const artists = await query<ArtistListRow>(
    `SELECT id, name, genre, origin, bio, url_media, description_media
     FROM artists
     ORDER BY name ASC`,
  );

  return res.status(200).json({ artists });
}
