import { Router } from "express";
// midellewares
import { validateBody } from "../middlewares/validateBody";
import { rateLimitLogin } from "../middlewares/rateLimitLogin";
import { auth } from "../middlewares/auth";
// controllers
import { login } from "../controllers/admin/auth/login.controller";
import { logout } from "../controllers/admin/auth/logout.controller";
//shema
import { loginSchema } from "../shemas/shema";

const router = Router();

// Auth administrateur
router.post("/auth/login", rateLimitLogin, validateBody(loginSchema), login); // Connexion administrateur
router.post("/auth/logout", auth, logout); // Deconnexion administrateur

export default router;
