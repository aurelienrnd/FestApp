import type { Request, Response } from "express";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";
import type { ArtistItem } from "../../../type";

/** Retourne un artiste par son identifiant avec son concert associe si existant.
 * Leve une AppError 404 si l'artiste n'existe pas.
 * @param {Request} req requete Express — `req.params.id` contient l'UUID de l'artiste
 * @param {Response} res reponse Express
 * @function query
 */
export async function getArtist(req: Request, res: Response) {
  // Extrait l'UUID de l'artiste depuis les paramètres de route.
  const { id } = req.params;

  // Récupère l'artiste et son concert associé depuis la base de données.
  const rows = await query<ArtistItem>(
    `SELECT a.id, a.name, a.genre, a.origin, a.bio, a.url_media, a.description_media,
            a.youtube_url, a.spotify_url, a.is_featured,
            c.stage, c.start_time, c.end_time
     FROM artists a
     LEFT JOIN concerts c ON c.artist_id = a.id
     WHERE a.id = $1`,
    [id],
  );

  // Lève une 404 si aucun artiste ne correspond à cet UUID.
  if (!rows[0]) throw new AppError(ERRORS.ARTIST_NOT_FOUND, 404);

  return res.status(200).json({ artist: rows[0] });
}
