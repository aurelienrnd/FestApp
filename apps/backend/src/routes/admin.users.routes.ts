import { Router } from "express";
// middlewares
import { validateBody } from "../middlewares/validateBody";
import { auth } from "../middlewares/auth";
import { sessionIsOpen } from "../middlewares/sessionIsOpen";
import { requireRole } from "../middlewares/requireRole";
import { asyncHandler } from "../middlewares/asyncHandler";
// controllers
import { createUser } from "../controllers/admin/users/create_user.controller";
import { deleteUser } from "../controllers/admin/users/delete_user.controller";
import { listUsers } from "../controllers/admin/users/list_users.controller";
import { updateUser } from "../controllers/admin/users/update_user.controller";
// schema
import { createUserSchema, updateUserSchema } from "../schemas/schema";

const router = Router();

router.get(
  "/users",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  requireRole("admin"),
  asyncHandler(listUsers),
); // Lister les utilisateurs

router.post(
  "/users",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  requireRole("admin"),
  validateBody(createUserSchema),
  asyncHandler(createUser),
); // Creer un utilisateur

router.patch(
  "/users/:id",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  requireRole("admin"),
  validateBody(updateUserSchema),
  asyncHandler(updateUser),
); // Modifier un utilisateur

router.delete(
  "/users/:id",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  requireRole("admin"),
  asyncHandler(deleteUser),
); // Supprimer definitivement un administrateur

export default router;
