import { Router } from "express";
// middlewares
import { validateBody } from "../middlewares/validateBody.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
// controllers
import { submitContact } from "../controllers/contact/submit_contact.controller.js";
// schemas
import { contactSchema } from "../schemas/schema.js";

const router = Router();

router.post(
  "/submit",
  validateBody(contactSchema),
  asyncHandler(submitContact),
); // Soumet le formulaire de contact et envoie un email a l'organisation

export default router;
