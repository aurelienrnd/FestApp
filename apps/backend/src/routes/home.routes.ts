import { Router } from "express";
// middlewares
import { asyncHandler } from "../middlewares/asyncHandler";
// controllers
import { getHome } from "../controllers/public/home/get_home.controller";

const router = Router();

router.get("/home", asyncHandler(getHome)); // Donnees agregees pour la page d'accueil

export default router;
