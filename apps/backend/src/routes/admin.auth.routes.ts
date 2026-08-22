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

// POST /auth/login, /auth/logout, /auth/me, /auth/password retires :
// geres par le catch-all Better Auth (sign-in/email, sign-out, get-session,
// change-password), monte dans app.ts sur /admin/auth/*.

router.post(
  "/auth/forgot-password",
  rateLimitLogin,
  validateBody(forgotPasswordSchema),
  asyncHandler(forgotPassword),
); // reinitialise le mot de passe et envoie un nouveau par email — migration prevue tache N°3 du Kanban

export default router;
