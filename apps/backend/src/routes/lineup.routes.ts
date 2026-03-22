import { Router } from "express";
// middlewares
import { asyncHandler } from "../middlewares/asyncHandler";
// controllers
import { listLineup } from "../controllers/public/lineup/list_lineup.controller";

const router = Router();

// Programmation (front-office)
router.get("/lineup", asyncHandler(listLineup)); // Voir la programmation (liste artistes)

export default router;
