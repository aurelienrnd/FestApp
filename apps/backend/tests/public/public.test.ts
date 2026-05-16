import request from "supertest";
import { app } from "../helpers/testServer";
import { createAuthSession } from "../helpers/createAuthSession";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";

// compteur local pour generer des creneaux uniques et eviter la contrainte no_overlap_stage
let artistCounter = 0;

/** Insere un artiste et son concert directement en base et retourne son id.
 * Chaque appel utilise un creneau de 2h decale du precedent (sans modulo pour eviter minuit).
 * @param isFeatured si l'artiste est mis en avant sur la home
 */
async function insertArtist(isFeatured = false): Promise<string> {
  const slot = artistCounter++;
  // creneaux de 2h a partir de minuit le 1er aout
  const base = new Date("2025-08-01T00:00:00Z");
  const start = new Date(base.getTime() + slot * 2 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const startTime = start.toISOString();
  const endTime = end.toISOString();

  // inserer l'artiste en base
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

  await query(
    `INSERT INTO concerts (artist_id, stage, start_time, end_time)
     VALUES ($1, $2, $3, $4)`,
    [artistId, "MainStage", startTime, endTime],
  );

  return artistId;
}

/** Insere une news directement en base et retourne son id.
 * @param isPublished si la news est publiee ou en brouillon
 */
async function insertNews(isPublished = true): Promise<string> {
  // creer un utilisateur auteur pour la news
  const users = await query<{ id: string }>(
    `INSERT INTO users (email, password_hash, display_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [
      `pub-author-${Date.now()}@test.com`,
      "hashed-password",
      `Auteur ${Date.now()}`,
      "news",
    ],
  );
  const authorId = users[0].id;

  // inserer la news en base
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

// ---------------------------------------------------------------------------

describe("GET /public/artists", () => {
  it("retourne 200 et la liste des artistes", async () => {
    // inserer deux artistes en base
    await insertArtist();
    await insertArtist();

    // appeler la route publique sans authentification
    const res = await request(app).get("/public/artists");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.artists)).toBe(true);
    expect(res.body.artists.length).toBeGreaterThanOrEqual(2);
  });

  it("retourne 200 avec une liste vide si aucun artiste", async () => {
    // appeler la route publique sans inserer d'artistes (table vide apres afterEach)
    const res = await request(app).get("/public/artists");

    expect(res.status).toBe(200);
    expect(res.body.artists).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------

describe("GET /public/artists/:id", () => {
  it("retourne 200 et le detail d'un artiste", async () => {
    // inserer un artiste en base
    const artistId = await insertArtist();

    // appeler la route publique avec l'id de l'artiste
    const res = await request(app).get(`/public/artists/${artistId}`);

    expect(res.status).toBe(200);
    expect(res.body.artist).toBeDefined();
    expect(res.body.artist.id).toBe(artistId);
  });

  it("retourne 404 si l'artiste n'existe pas", async () => {
    // utiliser un uuid valide mais inexistant en base
    const res = await request(app).get(
      "/public/artists/00000000-0000-0000-0000-000000000000",
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.ARTIST_NOT_FOUND);
  });
});

// ---------------------------------------------------------------------------

describe("GET /public/news", () => {
  it("retourne 200 et uniquement les news publiees sans authentification", async () => {
    // inserer une news publiee et un brouillon
    await insertNews(true);
    await insertNews(false);

    // appeler la route sans authentification
    const res = await request(app).get("/public/news");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.news)).toBe(true);
    // seule la news publiee doit etre retournee
    expect(res.body.news.length).toBe(1);
    expect(res.body.news[0].is_published).toBe(true);
  });

  it("retourne toutes les news (brouillons inclus) avec un role admin", async () => {
    // inserer une news publiee et un brouillon
    await insertNews(true);
    await insertNews(false);

    // creer une session admin qui peut voir les brouillons
    const { cookie } = await createAuthSession("admin");

    // appeler la route avec authentification admin
    const res = await request(app).get("/public/news").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.news.length).toBe(2);
  });

  it("retourne toutes les news (brouillons inclus) avec un role news", async () => {
    // inserer une news publiee et un brouillon
    await insertNews(true);
    await insertNews(false);

    // creer une session avec le role news qui peut voir les brouillons
    const { cookie } = await createAuthSession("news");

    // appeler la route avec authentification news
    const res = await request(app).get("/public/news").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.news.length).toBe(2);
  });

  it("retourne 200 avec une liste vide si aucune news publiee", async () => {
    // inserer uniquement un brouillon
    await insertNews(false);

    // appeler la route sans authentification
    const res = await request(app).get("/public/news");

    expect(res.status).toBe(200);
    expect(res.body.news).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------

describe("GET /public/news/:id", () => {
  it("retourne 200 et le detail d'une news publiee sans authentification", async () => {
    // inserer une news publiee
    const newsId = await insertNews(true);

    // appeler la route publique avec l'id de la news
    const res = await request(app).get(`/public/news/${newsId}`);

    expect(res.status).toBe(200);
    expect(res.body.news).toBeDefined();
    expect(res.body.news.id).toBe(newsId);
  });

  it("retourne 404 si la news est en brouillon sans authentification", async () => {
    // inserer une news non publiee (brouillon)
    const newsId = await insertNews(false);

    // appeler la route sans authentification (brouillon non visible)
    const res = await request(app).get(`/public/news/${newsId}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.NEWS_NOT_FOUND);
  });

  it("retourne 200 pour un brouillon avec un role admin", async () => {
    // inserer une news en brouillon
    const newsId = await insertNews(false);

    // creer une session admin qui peut voir les brouillons
    const { cookie } = await createAuthSession("admin");

    // appeler la route avec authentification admin
    const res = await request(app)
      .get(`/public/news/${newsId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.news.id).toBe(newsId);
  });

  it("retourne 404 si la news n'existe pas", async () => {
    // utiliser un uuid valide mais inexistant en base
    const res = await request(app).get(
      "/public/news/00000000-0000-0000-0000-000000000000",
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.NEWS_NOT_FOUND);
  });
});
