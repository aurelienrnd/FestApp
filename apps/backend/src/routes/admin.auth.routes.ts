import { Router } from "express";
// midellewares
import { validateBody } from "../middlewares/validateBody";
import { rateLimitLogin } from "../middlewares/rateLimitLogin";
// controllers
import { login } from "../controllers/admin/auth/login.controller";
//shema
import { loginSchema } from "../shemas/users.shema";

const router = Router();

// Auth administrateur
router.post("/auth/login", rateLimitLogin, validateBody(loginSchema), login); // Connexion administrateur
//router.post("/auth/logout", notImplemented); // Deconnexion administrateur
//router.post("/auth/lockout-check", notImplemented); // Protection tentatives multiples

export default router;
