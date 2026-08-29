import { Router } from "express";
// middlewares
import { optionalAuth } from "../middlewares/auth.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
// controllers
import { getNewsList } from "../controllers/public/news/get_news_list.controller.js";
import { getNews } from "../controllers/public/news/get_news.controller.js";

const router = Router();

router.get("/news", asyncHandler(optionalAuth), asyncHandler(getNewsList)); // Lister les news (toutes si admin/news, publiees uniquement sinon)
router.get("/news/:id", asyncHandler(optionalAuth), asyncHandler(getNews)); // Retourner une news par son id (brouillons accessibles si admin/news)

export default router;
