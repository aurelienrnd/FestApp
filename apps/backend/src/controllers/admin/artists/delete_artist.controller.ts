import type { Request, Response } from "express";
import { unlink } from "fs/promises";
import path from "path";
import { z } from "zod";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";
import type { ArtistListRow } from "../../../type";

const UPLOADS_DIR = path.join(__dirname, "../../../../uploads/artists");

/** Supprime definitivement un artiste, son concert associe et son fichier image.
 * Le concert est supprime en cascade par la base de donnees (ON DELETE CASCADE).
 * Le fichier image est supprime du disque apres la suppression en base.
 * @param {Request} req requete Express contenant l'id de l'artiste en parametre d'URL
 * @param {Response} res reponse Express
 */
export async function deleteArtist(req: Request, res: Response) {
  // valide que l'identifiant fourni est un UUID valide
  const paramsSchema = z.object({
    id: z.uuid(),
  });

  const parsedParams = paramsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    throw new AppError(ERRORS.VALIDATION_INVALID_BODY, 400);
  }

  // supprime l'artiste et retourne son url_media pour supprimer le fichier image
  const deletedArtists = await query<Pick<ArtistListRow, "id" | "url_media">>(
    "DELETE FROM artists WHERE id = $1 RETURNING id, url_media",
    [parsedParams.data.id],
  );

  if (deletedArtists.length === 0) {
    throw new AppError(ERRORS.ARTIST_NOT_FOUND, 404);
  }

  // supprime le fichier image du disque (echec silencieux si le fichier est absent)
  const artist = deletedArtists[0];
  if (artist) {
    const filename = path.basename(artist.url_media);
    const filepath = path.join(UPLOADS_DIR, filename);
    await unlink(filepath).catch(() => undefined);
  }

  return res.status(200).json({ message: "Artiste supprime" });
}
