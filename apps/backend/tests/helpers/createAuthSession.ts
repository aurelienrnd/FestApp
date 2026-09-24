import { auth } from "../../src/lib/auth.js";
import type { UserRole } from "../../src/type.js";

/** Cree un utilisateur et une vraie session Better Auth, retourne un cookie pret pour Supertest.
 * auth.api.createUser (plugin admin) cree le compte + son credential (scrypt) sans passer par
 * une route HTTP. auth.api.signInEmail avec asResponse: true renvoie un vrai Response fetch,
 * dont on extrait le Set-Cookie signe par Better Auth (impossible a reconstruire a la main).
 * @param {UserRole} role role de l'utilisateur a creer
 * @returns cookie pret a passer dans .set("Cookie", cookie) et userId
 */
export async function createAuthSession(
  role: UserRole,
): Promise<{ cookie: string; userId: string }> {
  // Cree un utilisateur de test avec le role demande et un mot de passe connu
  const email = `test-${role}-${Date.now()}@test.com`;
  const password = "TestPassword123!";

  const { user } = await auth.api.createUser({
    body: { email, password, name: `Test ${role}`, role: role as never },
  });

  // Se connecte pour obtenir une vraie session Better Auth (cookie signe avec BETTER_AUTH_SECRET)
  const response = await auth.api.signInEmail({
    body: { email, password },
    asResponse: true,
  });

  // Ne garde que "nom=valeur" du Set-Cookie (les attributs Path/HttpOnly/SameSite ne sont pas
  // valides dans un header Cookie de requete)
  const [setCookie] = response.headers.getSetCookie();
  if (!setCookie) {
    throw new Error("auth.api.signInEmail n'a renvoye aucun cookie de session");
  }
  const cookie = setCookie.split(";")[0]!;

  return { cookie, userId: user.id };
}
