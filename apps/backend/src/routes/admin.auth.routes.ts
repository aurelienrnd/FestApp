import { Router } from "express";
// middlewares
import { validateBody } from "../middlewares/validateBody.js";
import { rateLimitLogin } from "../middlewares/rateLimitLogin.js";
import { auth } from "../middlewares/auth.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
// controllers
import { login } from "../controllers/admin/auth/login.controller.js";
import { logout } from "../controllers/admin/auth/logout.controller.js";
import { userInfo } from "../controllers/admin/auth/user_info.controller.js";
import { changePassword } from "../controllers/admin/auth/change_password.controller.js";
import { forgotPassword } from "../controllers/admin/auth/forgot_password.controller.js";
// schema
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
} from "../schemas/schema.js";
// middlewares
import { hashPassword } from "../middlewares/hashPassword.js";

const router = Router();

router.post(
  "/auth/login",
  rateLimitLogin,
  validateBody(loginSchema),
  asyncHandler(login),
); // Connexion administrateur

router.post("/auth/logout", asyncHandler(auth), asyncHandler(logout)); // Deconnexion administrateur

router.get("/auth/me", asyncHandler(auth), asyncHandler(userInfo)); // recupere les infos utilisateur et verifie qu'il est connecte

router.post(
  "/auth/forgot-password",
  rateLimitLogin,
  validateBody(forgotPasswordSchema),
  asyncHandler(forgotPassword),
); // reinitialise le mot de passe et envoie un nouveau par email

router.patch(
  "/auth/password",
  asyncHandler(auth),
  validateBody(changePasswordSchema),
  asyncHandler(hashPassword("newPassword")),
  asyncHandler(changePassword),
); // modifie le mot de passe de l'utilisateur connecte

export default router;
