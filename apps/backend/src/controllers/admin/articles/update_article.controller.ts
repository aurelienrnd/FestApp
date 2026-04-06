import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { z } from "zod";
import { query } from "../../../db";
import { AppError } from "../../../errors/AppError";
import { ERRORS } from "../../../errors/errorMessages";
import type { ArticleRow } from "../../../type";

const UPLOADS_DIR = path.join(__dirname, "../../../../uploads/articles");

/** Modifie un article existant.
 * Si une nouvelle image est fournie, elle remplace l'ancienne (conversion WebP, suppression de l'ancienne).
 * @param {Request} req requete Express contenant l'id en parametre d'URL et les champs dans le body
 * @param {Response} res reponse Express
 */
export async function updateArticle(req: Request, res: Response) {
  // valide que l'identifiant fourni est un UUID valide
  const paramsSchema = z.object({ id: z.uuid() });
  const parsedParams = paramsSchema.safeParse(req.params);
  if (!parsedParams.success) {
    throw new AppError(ERRORS.VALIDATION_INVALID_BODY, 400);
  }

  const articleId = parsedParams.data.id;

  // verifie que l'article existe et recupere son url_media actuelle
  const existingArticles = await query<Pick<ArticleRow, "id" | "url_media">>(
    "SELECT id, url_media FROM articles WHERE id = $1 LIMIT 1",
    [articleId],
  );
  const existingArticle = existingArticles[0];
  if (!existingArticle) {
    throw new AppError(ERRORS.ARTICLE_NOT_FOUND, 404);
  }

  // extrait les champs texte de la requete
  const { title, content, is_published, description_media } = req.body;

  // convertit is_published de string en boolean (multipart envoie les booleens en string)
  const isPublished = is_published === "true";

  // determine l'url_media finale : nouvelle image ou conservation de l'existante
  let url_media = existingArticle.url_media;
  let newFilepath: string | null = null;

  if (req.file) {
    const uuid = randomUUID();
    const filename = `${uuid}.webp`;
    newFilepath = path.join(UPLOADS_DIR, filename);
    url_media = `/uploads/articles/${filename}`;
  }

  // ouvre une transaction SQL
  await query("BEGIN");

  let newFileWritten = false;

  try {
    // met a jour l'article et retourne les donnees avec le display_name de l'auteur via JOIN users
    const updatedArticles = await query<ArticleRow>(
      `UPDATE articles
       SET title = $1, content = $2, is_published = $3, url_media = $4, description_media = $5
       WHERE id = $6
       RETURNING *`,
      [
        title,
        content || null,
        isPublished,
        url_media,
        description_media,
        articleId,
      ],
    );

    const updatedArticle = updatedArticles[0];
    if (!updatedArticle) {
      throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);
    }

    // recupere le display_name de l'auteur via JOIN users
    const articlesWithAuthor = await query<ArticleRow>(
      `SELECT a.*, u.display_name AS author_name
       FROM articles a
       LEFT JOIN users u ON u.id = a.user_id
       WHERE a.id = $1`,
      [articleId],
    );

    const article = articlesWithAuthor[0];
    if (!article) {
      throw new AppError(ERRORS.INTERNAL_SERVER_ERROR, 500);
    }

    // cree le dossier, convertit et ecrit la nouvelle image si fournie
    if (req.file && newFilepath) {
      await mkdir(UPLOADS_DIR, { recursive: true });
      await sharp(req.file.buffer).webp({ quality: 80 }).toFile(newFilepath);
      newFileWritten = true;
    }

    // valide la transaction
    await query("COMMIT");

    // supprime l'ancienne image du disque si une nouvelle a ete uploadee (echec silencieux si absente)
    if (req.file) {
      const oldFilename = path.basename(existingArticle.url_media);
      const oldFilepath = path.join(UPLOADS_DIR, oldFilename);
      await unlink(oldFilepath).catch(() => undefined);
    }

    return res.status(200).json({ message: "Article modifie", article });
  } catch (error) {
    // annule la transaction, supprime le nouveau fichier si deja ecrit, puis relance pour le middleware
    await query("ROLLBACK");
    if (newFileWritten && newFilepath)
      await unlink(newFilepath).catch(() => undefined);
    throw error;
  }
}
