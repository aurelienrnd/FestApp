import { Router } from "express";
// middlewares
import { validateBody } from "../middlewares/validateBody";
import { rateLimitLogin } from "../middlewares/rateLimitLogin";
import { auth } from "../middlewares/auth";
import { sessionIsOpen } from "../middlewares/sessionIsOpen";
import { asyncHandler } from "../middlewares/asyncHandler";
// controllers
import { login } from "../controllers/admin/auth/login.controller";
import { logout } from "../controllers/admin/auth/logout.controller";
import { userInfo } from "../controllers/admin/auth/user_info.controller";
import { changePassword } from "../controllers/admin/auth/change_password.controller";
import { forgotPassword } from "../controllers/admin/auth/forgot_password.controller";
// schema
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
} from "../schemas/schema";
// middlewares
import { hashPassword } from "../middlewares/hashPassword";

const router = Router();

// Auth administrateur
router.post(
  "/auth/login",
  rateLimitLogin,
  validateBody(loginSchema),
  asyncHandler(login),
); // Connexion administrateur

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
