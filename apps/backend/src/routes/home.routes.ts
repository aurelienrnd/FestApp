import { Router } from "express";
// middlewares
import { asyncHandler } from "../middlewares/asyncHandler";
// controllers
import { getHome } from "../controllers/public/home/get_home.controller";

const router = Router();

// Page d'accueil (front-office)
router.get("/home", asyncHandler(getHome)); // Donnees agregees pour la page d'accueil

export default router;
