import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";
import type { ArtistListRow, ConcertRow } from "../../../type";

const UPLOADS_DIR = path.join(__dirname, "../../../../uploads/artists");

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
    stage,
    start_time,
    end_time,
  } = req.body;

  // genere un nom de fichier unique pour l'image, construit le chemin de destination et l'URL d'acces
  const uuid = randomUUID();
  const filename = `${uuid}.webp`;
  const filepath = path.join(UPLOADS_DIR, filename);
  const url_media = `/uploads/artists/${filename}`;

  // ouvre une transaction SQL
  await query("BEGIN");

  // indique si le fichier a deja ete ecrit pour le supprimer en cas d'erreur
  let fileWritten = false;

  try {
    // insere l'artiste en base de donnees et retourne les donnees de l'artiste cree
    const createdArtists = await query<ArtistListRow>(
      `INSERT INTO artists (name, genre, origin, bio, url_media, description_media)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, genre, origin, bio, url_media, description_media`,
      [name, genre, origin, bio, url_media, description_media],
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

    // cree le dossier de destination s'il n'existe pas, convertit l'image en WebP et l'ecrit sur le disque
    await mkdir(UPLOADS_DIR, { recursive: true });
    await sharp(req.file.buffer).webp({ quality: 80 }).toFile(filepath);
    fileWritten = true;

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
    // annule la transaction en cas d'erreur, supprime le fichier si deja ecrit, puis relance pour le middleware
    await query("ROLLBACK");
    if (fileWritten) await unlink(filepath).catch(() => undefined);
    throw error;
  }
}
