// Schema pour la creation d'un utilisateur
import { z } from "zod";

// Schema pour la creation d'un utilisateur, valide et trim les champs
export const createUserSchema = z.object({
  email: z.email(), // pas de trim() ici car zod cree deja une regex qui prend en compte les espaces
  password: z.string().min(8),
  display_name: z.string().min(2).max(30).trim(),
});

// Schema pour la connexion d'un utilisateur
export const loginSchema = z.object({
  email: z.email(), // pas de trim() ici car zod cree deja une regex qui prend en compte les espaces
  password: z.string().min(8),
});
