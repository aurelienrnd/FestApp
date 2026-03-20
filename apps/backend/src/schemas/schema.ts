// Schema pour la creation d'un utilisateur
import { z } from "zod";

/** Schema Zod de creation d'un utilisateur — valide et trim email, prénom, nom et role. */
export const createUserSchema = z.object({
  email: z.email(), // pas de trim() ici car zod cree deja une regex qui prend en compte les espaces
  first_name: z.string().min(2).max(30).trim(),
  last_name: z.string().min(2).max(30).trim(),
  role: z.enum(["admin", "lineup", "news"]),
});

/** Schema Zod de modification d'un utilisateur — valide et trim email, prénom, nom et role. */
export const updateUserSchema = z.object({
  email: z.email(), // pas de trim() ici car zod cree deja une regex qui prend en compte les espaces
  first_name: z.string().min(2).max(30).trim(),
  last_name: z.string().min(2).max(30).trim(),
  role: z.enum(["admin", "lineup", "news"]),
});

/** Schema Zod de changement de mot de passe — valide le mot de passe actuel et le nouveau (min 8 caracteres). */
export const changePasswordSchema = z.object({
  password: z.string().min(8),
  newPassword: z.string().min(8),
});

/** Schema Zod de connexion — valide l'email et le mot de passe (min 8 caracteres). */
export const loginSchema = z.object({
  email: z.email(), // pas de trim() ici car zod cree deja une regex qui prend en compte les espaces
  password: z.string().min(8),
});
