import { Router } from "express";
// middlewares
import { optionalAuth } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/asyncHandler";
// controllers
import { getArticles } from "../controllers/public/news/get_articles.controller";
import { getArticle } from "../controllers/public/news/get_article.controller";

const router = Router();

router.get("/news", asyncHandler(optionalAuth), asyncHandler(getArticles)); // Lister les articles (tous si admin/news, publies uniquement sinon)
router.get("/news/:id", asyncHandler(optionalAuth), asyncHandler(getArticle)); // Retourner un article par son id (brouillons accessibles si admin/news)

export default router;
