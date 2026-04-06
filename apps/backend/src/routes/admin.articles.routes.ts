import { Router } from "express";
// middlewares
import { auth } from "../middlewares/auth";
import { sessionIsOpen } from "../middlewares/sessionIsOpen";
import { requireRole } from "../middlewares/requireRole";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateBody } from "../middlewares/validateBody";
import { upload } from "../middlewares/upload";
// controllers
import { createArticle } from "../controllers/admin/articles/create_article.controller";
import { updateArticle } from "../controllers/admin/articles/update_article.controller";
import { deleteArticle } from "../controllers/admin/articles/delete_article.controller";
// schema
import { createArticleSchema } from "../schemas/schema";

const router = Router();

router.post(
  "/articles",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  requireRole("admin", "news"),
  upload.single("image"),
  validateBody(createArticleSchema),
  asyncHandler(createArticle),
); // Creer un article

router.patch(
  "/articles/:id",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  requireRole("admin", "news"),
  upload.single("image"),
  validateBody(createArticleSchema),
  asyncHandler(updateArticle),
); // Modifier un article

router.delete(
  "/articles/:id",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  requireRole("admin", "news"),
  asyncHandler(deleteArticle),
); // Supprimer un article

export default router;
