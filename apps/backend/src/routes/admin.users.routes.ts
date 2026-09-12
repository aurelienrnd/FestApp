import { Router } from "express";
// middlewares
import { adminAuth } from "../middlewares/authChain.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validateBody } from "../middlewares/validateBody.js";
import { validateUuidParam } from "../middlewares/validateUuidParam.js";
// controllers
import { createUser } from "../controllers/admin/users/create_user.controller.js";
import { deleteUser } from "../controllers/admin/users/delete_user.controller.js";
import { updateUser } from "../controllers/admin/users/update_user.controller.js";
// schema
import { createUserSchema } from "../schemas/schema.js";

const router = Router();

// Liste des utilisateurs : geree directement par Better Auth cote front
// (authClient.admin.listUsers -> /api/auth/admin/list-users), plus besoin de route custom ici.

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
