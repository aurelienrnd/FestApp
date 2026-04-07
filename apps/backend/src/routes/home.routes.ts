import { Router } from "express";
// middlewares
import { asyncHandler } from "../middlewares/asyncHandler";
// controllers
import { getHomeController } from "../controllers/public/home/get_home.controller";

const router = Router();

// Page d'accueil (front-office)
router.get("/home", asyncHandler(getHomeController)); // Donnees agregees pour la page d'accueil

export default router;
