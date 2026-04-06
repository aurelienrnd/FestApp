import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().optional(), // optional car en dev on peut se baser sur la valeur par defaut du port 3000, et en prod le port est fourni par la plateforme d'hebergement via une variable d'environnement
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string(),
  COOKIE_ACCESS_TOKEN_NAME: z.string(),
  COOKIE_ACCESS_TOKEN_SECURE: z.string(),
  COOKIE_ACCESS_TOKEN_SAME_SITE: z.string(),
  SESSION_EXPIRES_IN: z.string(),
  FRONTEND_ORIGIN: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  CONTACT_EMAIL: z.string(),
});

/** Valide toutes les variables d'environnement obligatoires au demarrage.
 * Lance une erreur et arrete le processus si une variable est manquante ou invalide.
 */
export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path[0]).join(", ");
    throw new Error(`Missing env vars: ${missing}`);
  }
}
