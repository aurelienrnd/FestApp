import { Router } from "express";
// middlewares
import { adminAuth } from "../middlewares/authChain";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateBody } from "../middlewares/validateBody";
import { validateUuidParam } from "../middlewares/validateUuidParam";
// controllers
import { createUser } from "../controllers/admin/users/create_user.controller";
import { deleteUser } from "../controllers/admin/users/delete_user.controller";
import { listUsers } from "../controllers/admin/users/list_users.controller";
import { updateUser } from "../controllers/admin/users/update_user.controller";
// schema
import { createUserSchema } from "../schemas/schema";

const router = Router();

router.get("/users", ...adminAuth("admin"), asyncHandler(listUsers)); // Lister les utilisateurs

router.post(
  "/users",
  ...adminAuth("admin"),
  validateBody(createUserSchema),
  asyncHandler(createUser),
); // Creer un utilisateur

router.patch(
  "/users/:id",
  ...adminAuth("admin"),
  validateUuidParam(),
  validateBody(createUserSchema),
  asyncHandler(updateUser),
); // Modifier un utilisateur

router.delete(
  "/users/:id",
  ...adminAuth("admin"),
  validateUuidParam(),
  asyncHandler(deleteUser),
); // Supprimer definitivement un administrateur

export default router;
