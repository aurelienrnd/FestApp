import type { Request, Response } from "express";
import { query } from "../../../db.js";
import { AppError } from "../../../errors/AppError.js";
import { ERRORS } from "../../../errors/errorMessages.js";
import {
  deleteImage,
  NEWS_UPLOADS_DIR,
} from "../../../services/imageUpload.service.js";
import type { NewsMediaRow } from "../../../type.js";

/** Supprime definitivement une news et son fichier image.
 * Le fichier image est supprime du disque apres la suppression en base (echec silencieux si absent).
 * @param {Request} req requete Express contenant l'id de la news en parametre d'URL
 * @param {Response} res reponse Express
 * @function query
 * @function deleteImage
 */
export async function deleteNews(req: Request, res: Response) {
  // supprime la news et retourne son url_media pour supprimer le fichier image
  const deletedNews = await query<NewsMediaRow>(
    "DELETE FROM news WHERE id = $1 RETURNING id, url_media",
    [req.params.id],
  );
  if (!deletedNews[0]) {
    throw new AppError(ERRORS.NEWS_NOT_FOUND, 404);
  }

  // supprime le fichier image du disque (echec silencieux si le fichier est absent)
  const news = deletedNews[0];
  if (news) {
    await deleteImage(NEWS_UPLOADS_DIR, news.url_media);
  }

  return res.status(200).json({ message: "News supprimee" });
}
