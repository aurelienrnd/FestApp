import { Router } from "express";
// middlewares
import { auth } from "../middlewares/auth";
import { sessionIsOpen } from "../middlewares/sessionIsOpen";
import { requireRole } from "../middlewares/requireRole";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateBody } from "../middlewares/validateBody";
import { validateUuidParam } from "../middlewares/validateUuidParam";
import { upload } from "../middlewares/upload";
// controllers
import { createArtist } from "../controllers/admin/artists/create_artist.controller";
import { updateArtist } from "../controllers/admin/artists/update_artist.controller";
import { deleteArtist } from "../controllers/admin/artists/delete_artist.controller";
// schema
import { createArtistSchema } from "../schemas/schema";

const router = Router();

router.post(
  "/artists",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  requireRole("admin", "artists"),
  upload.single("image"),
  validateBody(createArtistSchema),
  asyncHandler(createArtist),
); // Creer un artiste

router.patch(
  "/artists/:id",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  requireRole("admin", "artists"),
  validateUuidParam(),
  upload.single("image"),
  validateBody(createArtistSchema),
  asyncHandler(updateArtist),
); // Modifier un artiste

router.delete(
  "/artists/:id",
  asyncHandler(auth),
  asyncHandler(sessionIsOpen),
  requireRole("admin", "artists"),
  validateUuidParam(),
  asyncHandler(deleteArtist),
); // Supprimer un artiste

export default router;
