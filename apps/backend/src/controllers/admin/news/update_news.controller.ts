import type { Request, Response } from "express";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";
import { saveImage, deleteImage, NEWS_UPLOADS_DIR } from "../../../services/imageUpload.service";
import type { NewsItem, NewsMediaRow } from "../../../type";

/** Modifie une news existante.
 * Si une nouvelle image est fournie, elle remplace l'ancienne (conversion WebP, suppression de l'ancienne).
 * @param {Request} req requete Express contenant l'id en parametre d'URL et les champs dans le body
 * @param {Response} res reponse Express
 */
export async function updateNews(req: Request, res: Response) {
  const newsId = req.params.id;

  // verifie que la news existe et recupere son url_media actuelle
  const existingNews = await query<NewsMediaRow>(
    "SELECT id, url_media FROM news WHERE id = $1 LIMIT 1",
    [newsId],
  );
  const existingItem = existingNews[0];
  if (!existingItem) {
    throw new AppError(ERRORS.NEWS_NOT_FOUND, 404);
  }

  // extrait les champs texte de la requete
  const { title, content, is_published, description_media } = req.body;

  // convertit is_published de string en boolean (multipart envoie les booleens en string)
  const isPublished = is_published === "true";

  // si une nouvelle image est fournie, la convertit et l'ecrit avant la transaction
  let url_media = existingItem.url_media;
  if (req.file) {
    url_media = await saveImage(req.file.buffer, NEWS_UPLOADS_DIR, "/uploads/news");
  }

  // ouvre une transaction SQL
  await query("BEGIN");

  try {
    // met a jour la news
    const updatedNews = await query<NewsItem>(
      `UPDATE news
       SET title = $1, content = $2, is_published = $3, url_media = $4, description_media = $5
       WHERE id = $6
       RETURNING *`,
      [title, content || null, isPublished, url_media, description_media, newsId],
    );

    const updatedItem = updatedNews[0];
    if (!updatedItem) {
      throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);
    }

    // recupere le display_name de l'auteur via JOIN users
    const newsWithAuthor = await query<NewsItem>(
      `SELECT a.*, u.display_name AS author_name
       FROM news a
       LEFT JOIN users u ON u.id = a.user_id
       WHERE a.id = $1`,
      [newsId],
    );

    const news = newsWithAuthor[0];
    if (!news) {
      throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);
    }

    // valide la transaction
    await query("COMMIT");

    // supprime l'ancienne image apres le commit pour ne pas la perdre en cas d'erreur SQL
    if (req.file) {
      await deleteImage(NEWS_UPLOADS_DIR, existingItem.url_media);
    }

    return res.status(200).json({ message: "News modifiee", news });
  } catch (error) {
    // annule la transaction, supprime la nouvelle image si deja ecrite, puis relance pour le middleware
    await query("ROLLBACK");
    if (req.file) await deleteImage(NEWS_UPLOADS_DIR, url_media);
    throw error;
  }
}
