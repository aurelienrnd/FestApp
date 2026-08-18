import { Router } from "express";
// middlewares
import { asyncHandler } from "../middlewares/asyncHandler.js";
// controllers
import { listArtists } from "../controllers/public/artists/list_artists.controller.js";
import { getArtist } from "../controllers/public/artists/get_artist.controller.js";

const router = Router();

// Programmation (front-office)
router.get("/artists", asyncHandler(listArtists)); // Voir la programmation (liste artistes)
router.get("/artists/:id", asyncHandler(getArtist)); // Voir le detail d'un artiste

export default router;
