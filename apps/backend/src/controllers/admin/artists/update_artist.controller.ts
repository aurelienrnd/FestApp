import type { Request, Response } from "express";
import { z } from "zod";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";
import { saveImage, deleteImage, ARTISTS_ARTISTS_UPLOADS_DIR } from "../../../services/imageUpload.service";
import type { ArtistItem, ArtistMediaRow, ConcertRow } from "../../../type";

/** Modifie un artiste existant et son concert associe.
 * Si une nouvelle image est fournie, elle remplace l'ancienne (conversion WebP, suppression de l'ancienne).
 * La mise a jour de l'artiste et du concert se fait dans une seule transaction SQL.
 * @param {Request} req requete Express contenant l'id en parametre d'URL et les champs dans le body
 * @param {Response} res reponse Express
 */
export async function updateArtist(req: Request, res: Response) {
  // valide que l'identifiant fourni est un UUID valide
  const paramsSchema = z.object({ id: z.uuid() });
  const parsedParams = paramsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    throw new AppError(ERRORS.VALIDATION_INVALID_BODY, 400);
  }

  const artistId = parsedParams.data.id;

  // verifie que l'artiste existe et recupere son url_media actuelle
  const existingArtists = await query<ArtistMediaRow>(
    "SELECT id, url_media FROM artists WHERE id = $1 LIMIT 1",
    [artistId],
  );
  const existingArtist = existingArtists[0];
  if (!existingArtist) {
    throw new AppError(ERRORS.ARTIST_NOT_FOUND, 404);
  }

  // extrait les champs texte de la requete
  const {
    name,
    genre,
    origin,
    bio,
    description_media,
    youtube_url,
    spotify_url,
    stage,
    start_time,
    end_time,
    is_featured: is_featured_raw,
  } = req.body;

  const is_featured = is_featured_raw === "true";

  // si une nouvelle image est fournie, la convertit et l'ecrit avant la transaction
  let url_media = existingArtist.url_media;
  if (req.file) {
    url_media = await saveImage(req.file.buffer, ARTISTS_UPLOADS_DIR, "/uploads/artists");
  }

  // ouvre une transaction SQL
  await query("BEGIN");

  try {
    // met a jour l'artiste en base de donnees
    const updatedArtists = await query<ArtistItem>(
      `UPDATE artists
       SET name = $1, genre = $2, origin = $3, bio = $4, url_media = $5, description_media = $6, youtube_url = $7, spotify_url = $8, is_featured = $9
       WHERE id = $10
       RETURNING id, name, genre, origin, bio, url_media, description_media, youtube_url, spotify_url, is_featured`,
      [
        name,
        genre,
        origin,
        bio,
        url_media,
        description_media,
        youtube_url ?? null,
        spotify_url ?? null,
        is_featured,
        artistId,
      ],
    );

    const artist = updatedArtists[0];
    if (!artist) {
      throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);
    }

    // met a jour le concert associe
    const updatedConcerts = await query<ConcertRow>(
      `UPDATE concerts
       SET stage = $1, start_time = $2, end_time = $3
       WHERE artist_id = $4
       RETURNING id, artist_id, stage, start_time, end_time`,
      [stage, start_time, end_time, artistId],
    );

    const concert = updatedConcerts[0];
    if (!concert) {
      throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);
    }

    // valide la transaction
    await query("COMMIT");

    // supprime l'ancienne image apres le commit pour ne pas la perdre en cas d'erreur SQL
    if (req.file) {
      await deleteImage(ARTISTS_UPLOADS_DIR, existingArtist.url_media);
    }

    return res.status(200).json({
      message: "Artiste modifie",
      artist: {
        ...artist,
        stage: concert.stage,
        start_time: concert.start_time,
        end_time: concert.end_time,
      },
    });
  } catch (error) {
    // annule la transaction, supprime la nouvelle image si deja ecrite, puis relance pour le middleware
    await query("ROLLBACK");
    if (req.file) await deleteImage(ARTISTS_UPLOADS_DIR, url_media);
    if (error instanceof Error && error.message === "featured_limit_reached") {
      throw new AppError(ERRORS.ARTIST_FEATURED_LIMIT, 409);
    }
    throw error;
  }
}
