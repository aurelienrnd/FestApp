import { Router } from "express";
// midellewares
import { validateBody } from "../middlewares/validateBody";
import { hashPassword } from "../middlewares/hashPassword";
import { rateLimitLogin } from "../middlewares/rateLimitLogin";
// controllers
import { testGetUsers, createUser } from "../controllers/auth.controller";
import { login } from "../controllers/auth/login.controller";
//shema
import { createUserSchema, loginSchema } from "../shemas/users.shema";

const router = Router();
router.post(
  "/users",
  validateBody(createUserSchema),
  hashPassword(),
  createUser,
);
router.get("/test-users", testGetUsers); //NOTE cette route est juste pour tester la connexion a la base de donnée, a supprimer plus tard

router.post("/login", rateLimitLogin, validateBody(loginSchema), login);

export default router;
