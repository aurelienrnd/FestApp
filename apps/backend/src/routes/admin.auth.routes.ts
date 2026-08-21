import { Router } from "express";
// middlewares
import { validateBody } from "../middlewares/validateBody.js";
import { rateLimitLogin } from "../middlewares/rateLimitLogin.js";
import { auth } from "../middlewares/auth.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
// controllers
import { logout } from "../controllers/admin/auth/logout.controller.js";
import { userInfo } from "../controllers/admin/auth/user_info.controller.js";
import { changePassword } from "../controllers/admin/auth/change_password.controller.js";
import { forgotPassword } from "../controllers/admin/auth/forgot_password.controller.js";
// schema
import {
  changePasswordSchema,
  forgotPasswordSchema,
} from "../schemas/schema.js";
// middlewares
import { hashPassword } from "../middlewares/hashPassword.js";

const router = Router();

// POST /auth/login retire : gere par le catch-all Better Auth (sign-in/email), monte dans app.ts.

router.post("/auth/logout", asyncHandler(auth), asyncHandler(logout)); // Deconnexion administrateur — TODO: migrer vers sign-out (catch-all Better Auth)

router.get("/auth/me", asyncHandler(auth), asyncHandler(userInfo)); // recupere les infos utilisateur et verifie qu'il est connecte — TODO: migrer vers get-session (catch-all Better Auth)

router.post(
  "/auth/forgot-password",
  rateLimitLogin,
  validateBody(forgotPasswordSchema),
  asyncHandler(forgotPassword),
); // reinitialise le mot de passe et envoie un nouveau par email — migration prevue tache N°3 du Kanban

router.patch(
  "/auth/password",
  asyncHandler(auth),
  validateBody(changePasswordSchema),
  asyncHandler(hashPassword("newPassword")),
  asyncHandler(changePassword),
); // modifie le mot de passe de l'utilisateur connecte — TODO: migrer vers change-password (catch-all Better Auth)

export default router;
