import { Router } from "express";
// midellewares
import { validateBody } from "../middlewares/validateBody";
import { hashPassword } from "../middlewares/hashPassword";
// controllers
import { testGetUsers, createUser } from "../controllers/auth.controller";
//shema
import { createUserSchema } from "../shemas/users.shema";

const router = Router();
router.post(
  "/users",
  validateBody(createUserSchema),
  hashPassword(),
  createUser,
);
router.get("/test-users", testGetUsers); //NOTE cette route est juste pour tester la connexion a la base de donnée, a supprimer plus tard

export default router;
