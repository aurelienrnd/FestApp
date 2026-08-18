import type { Request, Response } from "express";
import { query } from "../../../db.js";
import { AppError } from "../../../errors/AppError.js";
import { ERRORS } from "../../../errors/errorMessages.js";
import {
  saveImage,
  deleteImage,
  NEWS_UPLOADS_DIR,
} from "../../../services/imageUpload.service.js";
import type { NewsItem } from "../../../type.js";

/** Cree une news avec une image convertie en WebP via sharp.
 * Verifie la presence du fichier image, le convertit en WebP (qualite 80),
 * l'ecrit sur le disque puis insere la news en base de donnees.
 * Retourne la news creee avec le display_name de l'auteur via JOIN users.
 * @param {Request} req requete Express contenant les champs dans le body et le fichier dans req.file
 * @param {Response} res reponse Express
 * @function query
 * @function saveImage
 * @function deleteImage
 */
export async function createNews(req: Request, res: Response) {
  // verifie que le fichier image est present dans la requete
  if (!req.file) {
    throw new AppError(ERRORS.NEWS_FILE_REQUIRED, 400);
  }

  // extrait les champs de la requete et convertit is_published de string en boolean (multipart envoie les booleens en string)
  const { title, content, is_published, description_media } = req.body;
  const isPublished = is_published === "true";

  // convertit et ecrit l'image sur le disque avant la transaction
  const url_media = await saveImage(
    req.file.buffer,
    NEWS_UPLOADS_DIR,
    "/uploads/news",
  );

  // ouvre une transaction SQL
  await query("BEGIN");

  try {
    // insere la news et retourne les donnees avec le display_name de l'auteur via JOIN users
    const createdNews = await query<NewsItem>(
      `WITH inserted AS (
         INSERT INTO news (title, content, is_published, url_media, description_media, user_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *
       )
       SELECT i.id, i.title, i.content, i.is_published, i.created_at,
              i.url_media, i.description_media,
              u.display_name AS author_name
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

    // valide la transaction
    await query("COMMIT");

    return res.status(201).json({ message: "News creee", news });
  } catch (error) {
    // annule la transaction, supprime le fichier deja ecrit, puis relance pour le middleware
    await query("ROLLBACK");
    await deleteImage(NEWS_UPLOADS_DIR, url_media);
    throw error;
  }
}
