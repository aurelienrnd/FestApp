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

/** Schema Zod de reinitialisation de mot de passe — valide uniquement l'email. */
export const forgotPasswordSchema = z.object({
  email: z.email(),
});

/** Schema Zod du formulaire de contact — valide l'email, le nom, le sujet et le message. */
export const contactSchema = z.object({
  email: z.email(),
  name: z.string().min(2).max(100).trim(),
  subject: z.string().min(2).max(150).trim(),
  message: z.string().min(10).max(2000).trim(),
});

/** Schema Zod de creation d'un artiste — valide les champs texte uniquement (l'image arrive via req.file).
 * Inclut les champs de programmation du concert associe (scene, heure de debut et de fin).
 */
export const createArtistSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  genre: z.string().min(1).max(60).trim(),
  origin: z.string().min(1).max(80).trim(),
  bio: z.string().min(1).trim(),
  description_media: z.string().min(1).max(255).trim(),
  stage: z.string().min(1).trim(),
  start_time: z.iso.datetime(),
  end_time: z.iso.datetime(),
});
