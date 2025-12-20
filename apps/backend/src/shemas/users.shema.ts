// Schéma pour la création d'un utilisateur
import { z } from "zod";

// Schéma pour la création d'un utilisateur
export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  display_name: z.string().min(2).max(80).optional(),
});
