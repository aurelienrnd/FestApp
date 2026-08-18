import { Router } from "express";
// middlewares
import { adminAuth } from "../middlewares/authChain.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { validateBody } from "../middlewares/validateBody.js";
import { validateUuidParam } from "../middlewares/validateUuidParam.js";
import { upload } from "../middlewares/upload.js";
// controllers
import { createArtist } from "../controllers/admin/artists/create_artist.controller.js";
import { updateArtist } from "../controllers/admin/artists/update_artist.controller.js";
import { deleteArtist } from "../controllers/admin/artists/delete_artist.controller.js";
// schema
import { createArtistSchema } from "../schemas/schema.js";

const router = Router();

router.post(
  "/artists",
  ...adminAuth("admin", "artists"),
  upload.single("image"),
  validateBody(createArtistSchema),
  asyncHandler(createArtist),
); // Creer un artiste

router.patch(
  "/artists/:id",
  ...adminAuth("admin", "artists"),
  validateUuidParam(),
  upload.single("image"),
  validateBody(createArtistSchema),
  asyncHandler(updateArtist),
); // Modifier un artiste

router.delete(
  "/artists/:id",
  ...adminAuth("admin", "artists"),
  validateUuidParam(),
  asyncHandler(deleteArtist),
); // Supprimer un artiste

export default router;
