import ms from "ms";
import { betterAuth } from "better-auth";
import { pool } from "../db.js";
import { getEnv, envToStringValue } from "../utils.js";

const SAME_SITE_VALUES = ["lax", "strict", "none"] as const;

/** Lit COOKIE_ACCESS_TOKEN_SAME_SITE et verifie qu'elle correspond a une valeur attendue. */
function getSameSite() {
  const value = getEnv("COOKIE_ACCESS_TOKEN_SAME_SITE");
  if (!SAME_SITE_VALUES.includes(value as (typeof SAME_SITE_VALUES)[number])) {
    throw new Error(
      `COOKIE_ACCESS_TOKEN_SAME_SITE invalide: "${value}" (attendu: ${SAME_SITE_VALUES.join(", ")})`,
    );
  }
  return value as (typeof SAME_SITE_VALUES)[number];
}

/** Instance Better Auth, branchee sur le pool PostgreSQL existant (db.ts).
 * Remplace la config JWT_ACCESS_SECRET / COOKIE_ACCESS_TOKEN_* / SESSION_EXPIRES_IN
 * lue jusque-la via env.ts par middlewares/auth.ts et middlewares/sessionIsOpen.ts.
 */
export const auth = betterAuth({
  database: pool,
  secret: getEnv("BETTER_AUTH_SECRET"),
  baseURL: getEnv("BETTER_AUTH_URL"),
  user: {
    // Reutilise la table "users" existante plutot que la table "user" par defaut
    modelName: "users",
    fields: {
      // Better Auth attend un champ standard "name" ; notre colonne s'appelle "display_name"
      name: "display_name",
    },
    additionalFields: {
      // "role" n'existe pas dans le schema Better Auth par defaut : on le declare
      // pour qu'il soit lu/type sur result.user.role (colonne "role" deja presente)
      role: {
        type: "string",
        required: true,
      },
    },
  },
  session: {
    // SESSION_EXPIRES_IN est un format duree ("1h", "12h"...), pas un nombre de
    // secondes brut — meme convention que utils.ts (encore utilise par l'ancien
    // flux JWT tant que sessionIsOpen.ts/login.controller.ts n'ont pas ete migres).
    expiresIn: ms(envToStringValue("SESSION_EXPIRES_IN")) / 1000,
  },
  advanced: {
    cookiePrefix: getEnv("COOKIE_ACCESS_TOKEN_NAME"),
    useSecureCookies: getEnv("COOKIE_ACCESS_TOKEN_SECURE") === "true",
    defaultCookieAttributes: {
      sameSite: getSameSite(),
    },
  },
});
