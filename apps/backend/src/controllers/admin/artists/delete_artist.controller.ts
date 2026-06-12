import type { Request, Response } from "express";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";
import {
  deleteImage,
  ARTISTS_UPLOADS_DIR,
} from "../../../services/imageUpload.service";
import type { ArtistMediaRow } from "../../../type";

/** Supprime definitivement un artiste, son concert associe et son fichier image.
 * Le concert est supprime en cascade par la base de donnees (ON DELETE CASCADE).
 * Le fichier image est supprime du disque apres la suppression en base.
 * @param {Request} req requete Express contenant l'id de l'artiste en parametre d'URL
 * @param {Response} res reponse Express
 */
export async function deleteArtist(req: Request, res: Response) {
  // supprime l'artiste et retourne son url_media pour supprimer le fichier image
  const deletedArtists = await query<ArtistMediaRow>(
    "DELETE FROM artists WHERE id = $1 RETURNING id, url_media",
    [req.params.id],
  );

  if (!deletedArtists[0]) {
    throw new AppError(ERRORS.ARTIST_NOT_FOUND, 404);
  }

  // supprime le fichier image du disque (echec silencieux si le fichier est absent)
  const artist = deletedArtists[0];
  if (artist) {
    await deleteImage(ARTISTS_UPLOADS_DIR, artist.url_media);
  }

  return res.status(200).json({ message: "Artiste supprime" });
}
