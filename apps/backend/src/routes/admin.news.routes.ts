import { Router } from "express";
// middlewares
import { adminAuth } from "../middlewares/authChain";
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
  ...adminAuth("admin", "news"),
  upload.single("image"),
  validateBody(createNewsSchema),
  asyncHandler(createNews),
); // Creer une news

router.patch(
  "/news/:id",
  ...adminAuth("admin", "news"),
  validateUuidParam(),
  upload.single("image"),
  validateBody(createNewsSchema),
  asyncHandler(updateNews),
); // Modifier une news

router.delete(
  "/news/:id",
  ...adminAuth("admin", "news"),
  validateUuidParam(),
  asyncHandler(deleteNews),
); // Supprimer une news

export default router;
