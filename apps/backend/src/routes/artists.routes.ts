import { Router } from "express";
// middlewares
import { asyncHandler } from "../middlewares/asyncHandler";
// controllers
import { listArtists } from "../controllers/public/artists/list_artists.controller";
import { getArtist } from "../controllers/public/artists/get_artist.controller";

const router = Router();

// Programmation (front-office)
router.get("/artists", asyncHandler(listArtists)); // Voir la programmation (liste artistes)
router.get("/artists/:id", asyncHandler(getArtist)); // Voir le detail d'un artiste

export default router;
