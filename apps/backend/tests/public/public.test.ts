import request from "supertest";
import { app } from "../helpers/testServer";
import { createAuthSession } from "../helpers/createAuthSession";
import { insertArtist, insertNews } from "../helpers/fixtures";
import { ERRORS } from "../../src/errors/errorMessages";

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
