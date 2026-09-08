import { Router } from "express";
// middlewares
import { validateBody } from "../middlewares/validateBody.js";
import { rateLimitLogin } from "../middlewares/rateLimitLogin.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
// controllers
import { forgotPassword } from "../controllers/admin/auth/forgot_password.controller.js";
// schema
import { forgotPasswordSchema } from "../schemas/schema.js";

const router = Router();

// Connexion administrateur : geree directement par Better Auth cote front
// (authClient.signIn.email -> /api/auth/sign-in/email), plus besoin de route custom ici.

// Deconnexion administrateur : geree directement par Better Auth cote front
// (authClient.signOut -> /api/auth/sign-out), plus besoin de route custom ici.

// Infos utilisateur connecte : gere directement par Better Auth cote front
// (fetch /api/auth/get-session), plus besoin de route custom ici.

router.post(
  "/auth/forgot-password",
  rateLimitLogin,
  validateBody(forgotPasswordSchema),
  asyncHandler(forgotPassword),
); // reinitialise le mot de passe et envoie un nouveau par email

// Changement de mot de passe de l'utilisateur connecte : gere directement par
// Better Auth cote front (authClient.changePassword -> /api/auth/change-password),
// plus besoin de route custom ici.

export default router;
