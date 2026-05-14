import { Router } from "express";
// middlewares
import { auth } from "../middlewares/auth";
import { sessionIsOpen } from "../middlewares/sessionIsOpen";
import { requireRole } from "../middlewares/requireRole";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateBody } from "../middlewares/validateBody";
import { validateUuidParam } from "../middlewares/validateUuidParam";
import { upload } from "../middlewares/upload";
// controllers
import { createNews } from "../controllers/admin/news/create_news.controller";
import { updateNews } from "../controllers/admin/news/update_news.controller";
import { deleteNews } from "../controllers/admin/news/delete_news.controller";
// schema
import { createNewsSchema } from "../schemas/schema";

const router = Router();

router.post(
  "/news",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  requireRole("admin", "news"),
  upload.single("image"),
  validateBody(createNewsSchema),
  asyncHandler(createNews),
); // Creer une news

router.patch(
  "/news/:id",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  requireRole("admin", "news"),
  validateUuidParam(),
  upload.single("image"),
  validateBody(createNewsSchema),
  asyncHandler(updateNews),
); // Modifier une news

router.delete(
  "/news/:id",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  requireRole("admin", "news"),
  validateUuidParam(),
  asyncHandler(deleteNews),
); // Supprimer une news

export default router;
