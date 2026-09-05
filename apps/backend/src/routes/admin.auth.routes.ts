import { Router } from "express";
// middlewares
import { validateBody } from "../middlewares/validateBody.js";
import { rateLimitLogin } from "../middlewares/rateLimitLogin.js";
import { auth } from "../middlewares/auth.js";
import { sessionIsOpen } from "../middlewares/sessionIsOpen.js";
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

// Connexion administrateur : geree directement par Better Auth cote front
// (authClient.signIn.email -> /api/auth/sign-in/email), plus besoin de route custom ici.

router.post("/auth/logout", asyncHandler(auth), asyncHandler(logout)); // Deconnexion administrateur

router.get(
  "/auth/me",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  asyncHandler(userInfo),
); // recupere les infos utilisateur et verifie qu'il est connecte

router.post(
  "/auth/forgot-password",
  rateLimitLogin,
  validateBody(forgotPasswordSchema),
  asyncHandler(forgotPassword),
); // reinitialise le mot de passe et envoie un nouveau par email

router.patch(
  "/auth/password",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  validateBody(changePasswordSchema),
  asyncHandler(hashPassword("newPassword")),
  asyncHandler(changePassword),
); // modifie le mot de passe de l'utilisateur connecte

export default router;
