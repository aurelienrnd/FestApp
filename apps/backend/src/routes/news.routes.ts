import { Router } from "express";
// middlewares
import { optionalAuth } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/asyncHandler";
// controllers
import { getNewsList } from "../controllers/public/news/get_news_list.controller";
import { getNews } from "../controllers/public/news/get_news.controller";

const router = Router();

router.get("/news", asyncHandler(optionalAuth), asyncHandler(getNewsList)); // Lister les news (toutes si admin/news, publiees uniquement sinon)
router.get("/news/:id", asyncHandler(optionalAuth), asyncHandler(getNews)); // Retourner une news par son id (brouillons accessibles si admin/news)

export default router;
