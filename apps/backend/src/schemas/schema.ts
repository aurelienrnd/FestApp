import { z } from "zod";

/** Schema Zod du formulaire de contact — valide l'email, le nom, le sujet et le message. */
export const contactSchema = z.object({
  email: z.email(),
  name: z.string().min(2).max(100).trim(),
  subject: z.string().min(2).max(150).trim(),
  message: z.string().min(10).max(2000).trim(),
});

/** Schema Zod de creation et modification d'une news — valide les champs texte uniquement (l'image arrive via req.file).
 * Le champ is_published est envoye en string via multipart/form-data.
 * Utilise pour la creation (POST) et la modification (PATCH).
 */
export const createNewsSchema = z.object({
  title: z.string().min(2).max(150).trim(),
  content: z.string().trim().optional().or(z.literal("")),
  is_published: z.enum(["true", "false"]).optional(),
  description_media: z.string().min(1).max(255).trim(),
});

/** Schema Zod de creation et modification d'un artiste — valide les champs texte uniquement (l'image arrive via req.file).
 * Inclut les champs de programmation du concert associe (scene, heure de debut et de fin).
 * Utilise pour la creation (POST) et la modification (PATCH).
 */
export const createArtistSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  genre: z.string().min(1).max(60).trim(),
  origin: z.string().min(1).max(80).trim(),
  bio: z.string().min(1).trim(),
  description_media: z.string().min(1).max(255).trim(),
  youtube_url: z
    .url()
    .max(255)
    .refine(
      (val) => /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(val),
      {
        message: "Le lien doit provenir de YouTube (youtube.com ou youtu.be).",
      },
    )
    .optional()
    .or(z.literal("")),
  spotify_url: z
    .url()
    .max(255)
    .refine((val) => /^https?:\/\/open\.spotify\.com\//.test(val), {
      message: "Le lien doit provenir de Spotify (open.spotify.com).",
    })
    .optional()
    .or(z.literal("")),
  stage: z.enum(["MainStage", "Tremplin"]),
  start_time: z.iso.datetime(),
  end_time: z.iso.datetime(),
  is_featured: z.enum(["true", "false"]).optional(),
});
