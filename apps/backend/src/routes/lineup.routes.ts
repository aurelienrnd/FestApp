import { Router } from "express";
// middlewares
import { asyncHandler } from "../middlewares/asyncHandler";
// controllers
import { listLineup } from "../controllers/public/lineup/list_lineup.controller";
import { getArtist } from "../controllers/public/lineup/get_artist.controller";

const router = Router();

// Programmation (front-office)
router.get("/lineup", asyncHandler(listLineup)); // Voir la programmation (liste artistes)
router.get("/lineup/:id", asyncHandler(getArtist)); // Voir le detail d'un artiste

export default router;
