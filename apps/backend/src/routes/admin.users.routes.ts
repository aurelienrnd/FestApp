import { Router } from "express";
// middlewares
import { validateBody } from "../middlewares/validateBody";
import { auth } from "../middlewares/auth";
import { sessionIsOpen } from "../middlewares/sessionIsOpen";
import { asyncHandler } from "../middlewares/asyncHandler";
// controllers
import { createUser } from "../controllers/admin/users/create_user.controller";
import { listUsers } from "../controllers/admin/users/list_users.controller";
// schema
import { createUserSchema } from "../schemas/schema";

const router = Router();

// Administrateurs
router.get(
  "/users",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  asyncHandler(listUsers),
); // Lister les utilisateurs
router.post(
  "/users",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  validateBody(createUserSchema),
  asyncHandler(createUser),
); // Creer un utilisateur
//router.put("/users/:id", notImplemented); // Modifier un administrateur
//router.delete("/users/:id", notImplemented); // Desactiver un administrateur

export default router;
