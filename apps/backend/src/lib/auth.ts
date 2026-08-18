import { betterAuth } from "better-auth";
import { pool } from "../db.js";
import { getEnv } from "../utils.js";

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
  session: {
    expiresIn: Number(getEnv("SESSION_EXPIRES_IN")),
  },
  advanced: {
    cookiePrefix: getEnv("COOKIE_ACCESS_TOKEN_NAME"),
    useSecureCookies: getEnv("COOKIE_ACCESS_TOKEN_SECURE") === "true",
    defaultCookieAttributes: {
      sameSite: getSameSite(),
    },
  },
});
