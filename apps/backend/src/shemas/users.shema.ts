// Schéma pour la création d'un utilisateur
import { email, z } from "zod";

// Schéma pour la création d'un utilisateur, valide et trime les champs
export const createUserSchema = z.object({
  email: z.email(), // pas de trim() ici car zod crée une regex qui prend deja en compte les espaces
  password: z.string().min(8),
  display_name: z.string().min(2).max(30).trim(),
});

// Schéma pour la connexion d'un utilisateur
export const loginSchema = z.object({
  email: z.email(), // pas de trim() ici car zod crée une regex qui prend deja en compte les espaces
  password: z.string().min(8),
});
