import { Router } from "express";
// midellewares
import { validateBody } from "../middlewares/validateBody";
import { hashPassword } from "../middlewares/hashPassword";
import { rateLimitLogin } from "../middlewares/rateLimitLogin";
// controllers
import { auth } from "../middlewares/auth";
import { createUser } from "../controllers/users/create_user.controller";
import { login } from "../controllers/users/login.controller";
//shema
import { createUserSchema, loginSchema } from "../shemas/users.shema";

const router = Router();
router.post(
  "/users",
  auth,
  validateBody(createUserSchema),
  hashPassword(),
  createUser,
);

router.post("/login", rateLimitLogin, validateBody(loginSchema), login);

export default router;
