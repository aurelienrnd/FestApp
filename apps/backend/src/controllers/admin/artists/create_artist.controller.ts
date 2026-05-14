import type { Request, Response } from "express";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";
import {
  saveImage,
  deleteImage,
  ARTISTS_UPLOADS_DIR,
} from "../../../services/imageUpload.service";
import type { ArtistItem, ConcertRow } from "../../../type";

/** Cree un artiste avec une image convertie en WebP via sharp.
 * Verifie la presence du fichier image, le convertit en WebP (qualite 80),
 * l'ecrit sur le disque puis insere l'artiste en base de donnees.
 */
export async function createArtist(req: Request, res: Response) {
  // verifie que le fichier image est present dans la requete
  if (!req.file) {
    throw new AppError(ERRORS.ARTIST_FILE_REQUIRED, 400);
  }

  // extrait les champs de la requete
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

  // convertit et ecrit l'image sur le disque avant la transaction
  const url_media = await saveImage(
    req.file.buffer,
    ARTISTS_UPLOADS_DIR,
    "/uploads/artists",
  );

  // ouvre une transaction SQL
  await query("BEGIN");

  try {
    // insere l'artiste en base de donnees et retourne les donnees de l'artiste cree
    const createdArtists = await query<ArtistItem>(
      `INSERT INTO artists (name, genre, origin, bio, url_media, description_media, youtube_url, spotify_url, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
      ],
    );

    // si l'insertion a echoue, retourne une erreur 500
    const artist = createdArtists[0];
    if (!artist) {
      throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);
    }

    // insere le concert associe a l'artiste
    const createdConcerts = await query<ConcertRow>(
      `INSERT INTO concerts (artist_id, stage, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING id, artist_id, stage, start_time, end_time`,
      [artist.id, stage, start_time, end_time],
    );

    // si l'insertion a echoue, retourne une erreur 500
    const concert = createdConcerts[0];
    if (!concert) {
      throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);
    }

    // valide la transaction
    await query("COMMIT");

    return res.status(201).json({
      message: "Artiste cree",
      artist: {
        ...artist,
        stage: concert.stage,
        start_time: concert.start_time,
        end_time: concert.end_time,
      },
    });
  } catch (error) {
    // annule la transaction, supprime le fichier deja ecrit, puis relance pour le middleware
    await query("ROLLBACK");
    await deleteImage(ARTISTS_UPLOADS_DIR, url_media);
    if (error instanceof Error && error.message === "featured_limit_reached") {
      throw new AppError(ERRORS.ARTIST_FEATURED_LIMIT, 409);
    }
    throw error;
  }
}
