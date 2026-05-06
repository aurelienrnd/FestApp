import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { z } from "zod";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";
import type { ArtistListRow, ArtistMediaRow, ConcertRow } from "../../../type";

const UPLOADS_DIR = path.join(__dirname, "../../../../uploads/artists");

/** Modifie un artiste existant et son concert associe.
 * Si une nouvelle image est fournie, elle remplace l'ancienne (conversion WebP, suppression de l'ancienne).
 * La mise a jour de l'artiste et du concert se fait dans une seule transaction SQL.
 * @param {Request} req requete Express contenant l'id en parametre d'URL et les champs dans le body
 * @param {Response} res reponse Express
 */
export async function updateArtist(req: Request, res: Response) {
  // valide que l'identifiant fourni est un UUID valide
  const paramsSchema = z.object({
    id: z.uuid(),
  });

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

  // determine l'url_media finale : nouvelle image ou conservation de l'existante
  let url_media = existingArtist.url_media;
  let newFilepath: string | null = null;

  if (req.file) {
    // genere un nom de fichier unique et construit le chemin de destination
    const uuid = randomUUID();
    const filename = `${uuid}.webp`;
    newFilepath = path.join(UPLOADS_DIR, filename);
    url_media = `/uploads/artists/${filename}`;
  }

  // ouvre une transaction SQL
  await query("BEGIN");

  let newFileWritten = false;

  try {
    // met a jour l'artiste en base de donnees
    const updatedArtists = await query<ArtistListRow>(
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

    // cree le dossier de destination s'il n'existe pas, convertit l'image en WebP et l'ecrit sur le disque
    if (req.file && newFilepath) {
      await mkdir(UPLOADS_DIR, { recursive: true });
      await sharp(req.file.buffer).webp({ quality: 80 }).toFile(newFilepath);
      newFileWritten = true;
    }

    // valide la transaction
    await query("COMMIT");

    // supprime l'ancienne image du disque si une nouvelle a ete uploadee
    if (req.file) {
      const oldFilename = path.basename(existingArtist.url_media);
      const oldFilepath = path.join(UPLOADS_DIR, oldFilename);
      await unlink(oldFilepath).catch(() => undefined);
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
    // annule la transaction en cas d'erreur, supprime le nouveau fichier si deja ecrit, puis relance pour le middleware
    await query("ROLLBACK");
    if (newFileWritten && newFilepath)
      await unlink(newFilepath).catch(() => undefined);
    if (error instanceof Error && error.message === "featured_limit_reached") {
      throw new AppError(ERRORS.ARTIST_FEATURED_LIMIT, 409);
    }
    throw error;
  }
}
