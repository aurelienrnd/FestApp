import { query } from "../../src/db";
import { auth } from "../../src/lib/auth";
import type { UserRole } from "../../src/type";

/** Image PNG minimale valide (1x1 px) utilisee comme fichier de test pour les routes multipart. */
export const MINIMAL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

/** Insere un utilisateur via Better Auth (auth.api.createUser) et retourne son id.
 * Delegue la creation du compte credential (hash scrypt) a Better Auth plutot que d'inserer
 * directement en base — evite de dupliquer sa logique de hachage dans les fixtures.
 * @param email email unique de l'utilisateur
 * @param name nom affiche (defaut : unique via Date.now())
 * @param role role de l'utilisateur (defaut : "admin")
 */
export async function insertUser(
  email: string,
  name = `Test User ${Date.now()}`,
  role: UserRole = "admin",
): Promise<string> {
  const { user } = await auth.api.createUser({
    body: { email, password: "TestPassword123!", name, role },
  });
  return user.id;
}

// compteur de slot pour generer des creneaux de concert uniques entre les appels
let _artistSlot = 0;

/** Insere un artiste et son concert directement en base et retourne son id.
 * Chaque appel utilise un creneau de 2h distinct (sans modulo pour eviter minuit).
 * @param isFeatured si l'artiste est mis en avant sur la home (defaut : false)
 */
export async function insertArtist(isFeatured = false): Promise<string> {
  const slot = _artistSlot++;
  const base = new Date("2025-08-01T00:00:00Z");
  const start = new Date(base.getTime() + slot * 2 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  // on insert un artiste dans la base
  const artists = await query<{ id: string }>(
    `INSERT INTO artists (name, genre, origin, bio, url_media, description_media, is_featured)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      `Artist ${slot}`,
      "Metal",
      "France",
      "Bio de test",
      "/uploads/artists/test.webp",
      "Photo de scene",
      isFeatured,
    ],
  );
  const artistId = artists[0].id;

  // on insert un concert pour cet artiste
  await query(
    `INSERT INTO concerts (artist_id, stage, start_time, end_time)
     VALUES ($1, $2, $3, $4)`,
    [artistId, "MainStage", start.toISOString(), end.toISOString()],
  );

  return artistId;
}

/** Insere une news directement en base et retourne son id.
 * Cree automatiquement un utilisateur auteur si aucun userId n'est fourni.
 * @param isPublished si la news est publiee (defaut : true)
 * @param userId id de l'auteur existant (cree automatiquement si absent)
 */
export async function insertNews(
  isPublished = true,
  userId?: string,
): Promise<string> {
  // on determine l'auteur de la news : soit celui fourni, soit un nouvel utilisateur de test
  let authorId = userId;
  if (!authorId) {
    authorId = await insertUser(
      `news-author-${Date.now()}@test.com`,
      `Auteur ${Date.now()}`,
      "news",
    );
  }

  // on insert la news dans la base
  const news = await query<{ id: string }>(
    `INSERT INTO news (title, content, is_published, url_media, description_media, user_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      `News ${Date.now()}`,
      "Contenu de test",
      isPublished,
      "/uploads/news/test.webp",
      "Description",
      authorId,
    ],
  );

  return news[0].id;
}
