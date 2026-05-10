import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";
import type { NewsItem } from "../../../type";

const UPLOADS_DIR = path.join(__dirname, "../../../../uploads/news");

/** Cree une news avec une image convertie en WebP via sharp.
 * Verifie la presence du fichier image, le convertit en WebP (qualite 80),
 * l'ecrit sur le disque puis insere la news en base de donnees.
 * Retourne la news creee avec le display_name de l'auteur via JOIN users.
 * @param {Request} req requete Express contenant les champs dans le body et le fichier dans req.file
 * @param {Response} res reponse Express
 */
export async function createNews(req: Request, res: Response) {
  // verifie que le fichier image est present dans la requete
  if (!req.file) {
    throw new AppError(ERRORS.NEWS_FILE_REQUIRED, 400);
  }

  // extrait les champs de la requete
  const { title, content, is_published, description_media } = req.body;

  // convertit is_published de string en boolean (multipart envoie les booleens en string)
  const isPublished = is_published === "true";

  // genere un nom de fichier unique pour l'image, construit le chemin de destination et l'URL d'acces
  const uuid = randomUUID();
  const filename = `${uuid}.webp`;
  const filepath = path.join(UPLOADS_DIR, filename);
  const url_media = `/uploads/news/${filename}`;

  // ouvre une transaction SQL
  await query("BEGIN");

  let fileWritten = false;

  try {
    // insere la news et retourne les donnees avec le display_name de l'auteur via JOIN users
    const createdNews = await query<NewsItem>(
      `WITH inserted AS (
         INSERT INTO news (title, content, is_published, url_media, description_media, user_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *
       )
       SELECT i.*, u.display_name AS author_name
       FROM inserted i
       LEFT JOIN users u ON u.id = i.user_id`,
      [
        title,
        content || null,
        isPublished,
        url_media,
        description_media,
        res.locals.userId,
      ],
    );

    const news = createdNews[0];
    if (!news) {
      throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);
    }

    // cree le dossier de destination s'il n'existe pas, convertit l'image en WebP et l'ecrit sur le disque
    await mkdir(UPLOADS_DIR, { recursive: true });
    await sharp(req.file.buffer).webp({ quality: 80 }).toFile(filepath);
    fileWritten = true;

    // valide la transaction
    await query("COMMIT");

    return res.status(201).json({ message: "News creee", news });
  } catch (error) {
    // annule la transaction en cas d'erreur, supprime le fichier si deja ecrit, puis relance pour le middleware
    await query("ROLLBACK");
    if (fileWritten) await unlink(filepath).catch(() => undefined);
    throw error;
  }
}
