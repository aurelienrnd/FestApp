import type { Request, Response } from "express";
import { unlink } from "fs/promises";
import path from "path";
import { z } from "zod";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";
import type { ArticleRow } from "../../../type";

const UPLOADS_DIR = path.join(__dirname, "../../../../uploads/articles");

/** Supprime definitivement un article et son fichier image.
 * Le fichier image est supprime du disque apres la suppression en base (echec silencieux si absent).
 * @param {Request} req requete Express contenant l'id de l'article en parametre d'URL
 * @param {Response} res reponse Express
 */
export async function deleteArticle(req: Request, res: Response) {
  // valide que l'identifiant fourni est un UUID valide
  const paramsSchema = z.object({ id: z.uuid() });
  const parsedParams = paramsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    throw new AppError(ERRORS.VALIDATION_INVALID_BODY, 400);
  }

  // supprime l'article et retourne son url_media pour supprimer le fichier image
  const deletedArticles = await query<Pick<ArticleRow, "id" | "url_media">>(
    "DELETE FROM articles WHERE id = $1 RETURNING id, url_media",
    [parsedParams.data.id],
  );

  if (deletedArticles.length === 0) {
    throw new AppError(ERRORS.ARTICLE_NOT_FOUND, 404);
  }

  // supprime le fichier image du disque (echec silencieux si le fichier est absent ou URL externe)
  const article = deletedArticles[0];
  if (article) {
    const filename = path.basename(article.url_media);
    const filepath = path.join(UPLOADS_DIR, filename);
    await unlink(filepath).catch(() => undefined);
  }

  return res.status(200).json({ message: "Article supprime" });
}
