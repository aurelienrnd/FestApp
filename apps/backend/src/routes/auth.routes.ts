import { Router } from "express";
// midellewares
import { validateBody } from "../middlewares/validateBody";
import { hashPassword } from "../middlewares/hashPassword";
import { rateLimitLogin } from "../middlewares/rateLimitLogin";
import { sessionIsOpen } from "../middlewares/sessionIsOpen";
import { auth } from "../middlewares/auth";
// controllers
import { createUser } from "../controllers/users/create_user.controller";
import { login } from "../controllers/users/login.controller";
//shema
import { createUserSchema, loginSchema } from "../shemas/users.shema";

const router = Router();
router.post(
  "/users",
  auth,
  sessionIsOpen,
  validateBody(createUserSchema),
  hashPassword(),
  createUser,
);

router.post("/login", rateLimitLogin, validateBody(loginSchema), login);

export default router;
