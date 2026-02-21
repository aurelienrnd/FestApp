import { Router } from "express";
// middlewares
import { validateBody } from "../middlewares/validateBody";
import { auth } from "../middlewares/auth";
import { sessionIsOpen } from "../middlewares/sessionIsOpen";
import { hashPassword } from "../middlewares/hashPassword";
// controllers
import { createUser } from "../controllers/admin/users/create_user.controller";
// schema
import { createUserSchema } from "../schemas/schema";

const router = Router();

// Administrateurs
//router.get("/users", notImplemented); // Lister les administrateurs
router.post(
  "/users",
  auth,
  sessionIsOpen,
  validateBody(createUserSchema),
  hashPassword(),
  createUser,
); // Creer un administrateur
//router.put("/users/:id", notImplemented); // Modifier un administrateur
//router.delete("/users/:id", notImplemented); // Desactiver un administrateur

export default router;
