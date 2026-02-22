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
import { userInfo } from "../controllers/admin/auth/userInfo.controller";
// schema
import { loginSchema } from "../schemas/schema";

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

export default router;
