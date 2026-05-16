import { query } from "../../src/db";
import type { UserRole } from "../../src/type";

/** Image PNG minimale valide (1x1 px) utilisee comme fichier de test pour les routes multipart. */
export const MINIMAL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

/** Insere un utilisateur directement en base et retourne son id.
 * @param email email unique de l'utilisateur
 * @param displayName nom affiche (defaut : "Test User")
 * @param role role de l'utilisateur (defaut : "admin")
 * @param passwordHash hash bcrypt ou placeholder (defaut : "hashed-password")
 */
export async function insertUser(
  email: string,
  displayName = "Test User",
  role: UserRole = "admin",
  passwordHash = "hashed-password",
): Promise<string> {
  const rows = await query<{ id: string }>(
    `INSERT INTO users (email, password_hash, display_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [email, passwordHash, displayName, role],
  );
  return rows[0].id;
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
