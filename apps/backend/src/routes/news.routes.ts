import { Router } from "express";
// middlewares
import { optionalAuth } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/asyncHandler";
// controllers
import { getArticles } from "../controllers/public/news/get_articles.controller";

const router = Router();

router.get(
  "/news",
  asyncHandler(optionalAuth),
  asyncHandler(getArticles),
); // Lister les articles (tous si admin/news, publies uniquement sinon)

export default router;
