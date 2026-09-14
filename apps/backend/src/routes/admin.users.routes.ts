import { Router } from "express";
// middlewares
import { adminAuth } from "../middlewares/authChain.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validateUuidParam } from "../middlewares/validateUuidParam.js";
// controllers
import { deleteUser } from "../controllers/admin/users/delete_user.controller.js";

const router = Router();

// Liste des utilisateurs : geree directement par Better Auth cote front
// (authClient.admin.listUsers -> /api/auth/admin/list-users), plus besoin de route custom ici.

// Creation d'un utilisateur : geree directement par Better Auth cote front
// (authClient.admin.createUser + authClient.requestPasswordReset -> l'utilisateur choisit
// son mot de passe via le meme lien que "mot de passe oublie"), plus besoin de route custom ici.

// Modification d'un utilisateur : geree directement par Better Auth cote front
// (authClient.admin.updateUser -> /api/auth/admin/update-user), plus besoin de route custom ici.

router.delete(
  "/users/:id",
  ...adminAuth("admin"),
  validateUuidParam(),
  asyncHandler(deleteUser),
); // Supprimer definitivement un administrateur

export default router;
