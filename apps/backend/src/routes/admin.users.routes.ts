import { Router } from "express";
// midellewares
import { validateBody } from "../middlewares/validateBody";
import { auth } from "../middlewares/auth";
import { sessionIsOpen } from "../middlewares/sessionIsOpen";
import { hashPassword } from "../middlewares/hashPassword";
// controllers
import { createUser } from "../controllers/admin/users/create_user.controller";
//shema
import { createUserSchema } from "../shemas/users.shema";

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
); // Créer un administrateur
//router.put("/users/:id", notImplemented); // Modifier un administrateur
//router.delete("/users/:id", notImplemented); // Desactiver / supprimer un administrateur

export default router;
