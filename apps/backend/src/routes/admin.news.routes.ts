import { Router } from "express";
// middlewares
import { adminAuth } from "../middlewares/authChain.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validateBody } from "../middlewares/validateBody.js";
import { validateUuidParam } from "../middlewares/validateUuidParam.js";
import { upload } from "../middlewares/upload.js";
// controllers
import { createNews } from "../controllers/admin/news/create_news.controller.js";
import { updateNews } from "../controllers/admin/news/update_news.controller.js";
import { deleteNews } from "../controllers/admin/news/delete_news.controller.js";
// schema
import { createNewsSchema } from "../schemas/schema.js";

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
