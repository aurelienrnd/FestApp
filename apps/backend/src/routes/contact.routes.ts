import { Router } from "express";
// middlewares
import { validateBody } from "../middlewares/validateBody";
import { asyncHandler } from "../middlewares/asyncHandler";
// controllers
import { submitContact } from "../controllers/contact/submit_contact.controller";
// schemas
import { contactSchema } from "../schemas/schema";

const router = Router();

router.post(
  "/submit",
  validateBody(contactSchema),
  asyncHandler(submitContact),
); // Soumet le formulaire de contact et envoie un email a l'organisation

export default router;
