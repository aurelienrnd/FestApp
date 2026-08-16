import { betterAuth } from "better-auth";
import { pool } from "../db";
import { getEnv } from "../utils";

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
      sameSite: getEnv("COOKIE_ACCESS_TOKEN_SAME_SITE"),
    },
  },
});
