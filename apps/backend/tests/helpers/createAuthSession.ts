import { query } from "../../src/db";
import { initToken, getEnv } from "../../src/utils";
import type { UserRole } from "../../src/type";

/** Insere un user et une session en base, retourne un cookie JWT valide pour Supertest.
 * @param {UserRole} role role de l'utilisateur a creer
 * @returns cookie pret a passer dans .set("Cookie", cookie) et userId
 */
export async function createAuthSession(
  role: UserRole,
): Promise<{ cookie: string; userId: string }> {
  // Insere un user de test avec le role demande
  const email = `test-${role}-${Date.now()}@test.com`;
  const users = await query<{ id: string }>(
    `INSERT INTO users (email, password_hash, display_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [email, "hashed-password", `Test ${role}`, role],
  );
  const userId = users[0].id;

  // Insere une session valide (non revoquee, expiration dans 1h)
  const sessions = await query<{ id: string }>(
    `INSERT INTO sessions (user_id, expires_at)
     VALUES ($1, NOW() + INTERVAL '1 hour')
     RETURNING id`,
    [userId],
  );
  const sessionId = sessions[0].id;

  // Genere un JWT signe avec le secret de test
  const token = initToken(
    userId,
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES_IN",
    sessionId,
  );

  // Format Cookie request header : juste nom=valeur, sans les attributs Set-Cookie
  const cookieName = getEnv("COOKIE_ACCESS_TOKEN_NAME");
  const cookie = `${cookieName}=${token}`;

  return { cookie, userId };
}
