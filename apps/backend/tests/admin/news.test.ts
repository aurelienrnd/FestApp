import request from "supertest";
import { app } from "../helpers/testServer";
import { createAuthSession } from "../helpers/createAuthSession";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";

// image minimale PNG valide (1x1 px) encodee en base64
const MINIMAL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

// champs valides pour la creation d'une news (sans image)
const VALID_NEWS_FIELDS = {
  title: "Titre de test",
  description_media: "Description de l'image",
  is_published: "true",
};

/** Insere une news directement en base et retourne son id.
 * @param userId id de l'auteur (cree automatiquement si absent)
 * @param isPublished si la news est publiee
 */
async function insertNews(
  userId?: string,
  isPublished = true,
): Promise<string> {
  // creer un utilisateur de rattachement si aucun userId n'est fourni
  let authorId = userId;
  if (!authorId) {
    const users = await query<{ id: string }>(
      `INSERT INTO users (email, password_hash, display_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        `news-author-${Date.now()}@test.com`,
        "hashed-password",
        `Auteur ${Date.now()}`,
        "news",
      ],
    );
    authorId = users[0].id;
  }

  // inserer la news en base avec les champs requis
  const news = await query<{ id: string }>(
    `INSERT INTO news (title, content, is_published, url_media, description_media, user_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      "News DB",
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

describe("POST /admin/news", () => {
  it("retourne 201 et cree une news avec les bons champs", async () => {
    // creer une session avec le role news
    const { cookie } = await createAuthSession("news");

    // envoyer une requete multipart avec les champs et l'image
    const res = await request(app)
      .post("/admin/news")
      .set("Cookie", cookie)
      .field("title", VALID_NEWS_FIELDS.title)
      .field("description_media", VALID_NEWS_FIELDS.description_media)
      .field("is_published", VALID_NEWS_FIELDS.is_published)
      .attach("image", MINIMAL_PNG, "image.png");

    expect(res.status).toBe(201);
    expect(res.body.news).toBeDefined();
    expect(res.body.news.title).toBe(VALID_NEWS_FIELDS.title);
  });

  it("retourne 400 si aucune image n'est fournie", async () => {
    // creer une session avec le role news
    const { cookie } = await createAuthSession("news");

    // envoyer une requete sans fichier image
    const res = await request(app)
      .post("/admin/news")
      .set("Cookie", cookie)
      .field("title", VALID_NEWS_FIELDS.title)
      .field("description_media", VALID_NEWS_FIELDS.description_media);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.NEWS_FILE_REQUIRED);
  });

  it("retourne 400 si le body est invalide", async () => {
    // creer une session avec le role news
    const { cookie } = await createAuthSession("news");

    // envoyer une requete avec un titre trop court (min 2 caracteres)
    const res = await request(app)
      .post("/admin/news")
      .set("Cookie", cookie)
      .field("title", "A")
      .attach("image", MINIMAL_PNG, "image.png");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
  });

  it("retourne 403 avec un role non autorise (artists)", async () => {
    // creer une session avec le role artists qui n'a pas acces aux routes news
    const { cookie } = await createAuthSession("artists");

    // envoyer une requete multipart avec les champs et l'image
    const res = await request(app)
      .post("/admin/news")
      .set("Cookie", cookie)
      .field("title", VALID_NEWS_FIELDS.title)
      .attach("image", MINIMAL_PNG, "image.png");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(ERRORS.FORBIDDEN);
  });

  it("retourne 401 sans cookie", async () => {
    // envoyer une requete sans cookie de session
    const res = await request(app)
      .post("/admin/news")
      .field("title", VALID_NEWS_FIELDS.title)
      .attach("image", MINIMAL_PNG, "image.png");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_MISSING_COOKIE);
  });
});

// ---------------------------------------------------------------------------

describe("PATCH /admin/news/:id", () => {
  it("retourne 200 et modifie la news", async () => {
    // inserer une news en base
    const newsId = await insertNews();

    // creer une session avec le role news
    const { cookie } = await createAuthSession("news");

    // modifier la news avec un nouveau titre
    const res = await request(app)
      .patch(`/admin/news/${newsId}`)
      .set("Cookie", cookie)
      .field("title", "Nouveau Titre")
      .field("description_media", VALID_NEWS_FIELDS.description_media)
      .field("is_published", "false");

    expect(res.status).toBe(200);
    expect(res.body.news.title).toBe("Nouveau Titre");
  });

  it("retourne 200 et modifie la news avec une nouvelle image", async () => {
    // inserer une news en base
    const newsId = await insertNews();

    // creer une session avec le role news
    const { cookie } = await createAuthSession("news");

    // modifier la news en fournissant une nouvelle image
    const res = await request(app)
      .patch(`/admin/news/${newsId}`)
      .set("Cookie", cookie)
      .field("title", VALID_NEWS_FIELDS.title)
      .field("description_media", VALID_NEWS_FIELDS.description_media)
      .field("is_published", VALID_NEWS_FIELDS.is_published)
      .attach("image", MINIMAL_PNG, "image.png");

    expect(res.status).toBe(200);
    expect(res.body.news).toBeDefined();
  });

  it("retourne 404 si la news n'existe pas", async () => {
    // creer une session avec le role news
    const { cookie } = await createAuthSession("news");

    // utiliser un uuid valide mais inexistant en base
    const res = await request(app)
      .patch("/admin/news/00000000-0000-0000-0000-000000000000")
      .set("Cookie", cookie)
      .field("title", VALID_NEWS_FIELDS.title)
      .field("description_media", VALID_NEWS_FIELDS.description_media);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.NEWS_NOT_FOUND);
  });

  it("retourne 400 si l'id n'est pas un UUID valide", async () => {
    // creer une session avec le role news
    const { cookie } = await createAuthSession("news");

    // utiliser un id qui n'est pas un UUID
    const res = await request(app)
      .patch("/admin/news/pas-un-uuid")
      .set("Cookie", cookie)
      .field("title", VALID_NEWS_FIELDS.title);

    expect(res.status).toBe(400);
  });

  it("retourne 403 avec un role non autorise (artists)", async () => {
    // inserer une news en base
    const newsId = await insertNews();

    // creer une session avec le role artists qui n'a pas acces aux routes news
    const { cookie } = await createAuthSession("artists");

    // envoyer une requete multipart avec les champs et l'image
    const res = await request(app)
      .patch(`/admin/news/${newsId}`)
      .set("Cookie", cookie)
      .field("title", VALID_NEWS_FIELDS.title);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(ERRORS.FORBIDDEN);
  });

  it("retourne 401 sans cookie", async () => {
    // inserer une news en base
    const newsId = await insertNews();

    // envoyer une requete sans cookie de session
    const res = await request(app)
      .patch(`/admin/news/${newsId}`)
      .field("title", VALID_NEWS_FIELDS.title);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_MISSING_COOKIE);
  });
});

// ---------------------------------------------------------------------------

describe("DELETE /admin/news/:id", () => {
  it("retourne 200 et supprime la news", async () => {
    // inserer une news en base
    const newsId = await insertNews();

    // creer une session avec le role news
    const { cookie } = await createAuthSession("news");

    // supprimer la news
    const res = await request(app)
      .delete(`/admin/news/${newsId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
  });

  it("retourne 404 si la news n'existe pas", async () => {
    // creer une session avec le role news
    const { cookie } = await createAuthSession("news");

    // utiliser un uuid valide mais inexistant en base
    const res = await request(app)
      .delete("/admin/news/00000000-0000-0000-0000-000000000000")
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.NEWS_NOT_FOUND);
  });

  it("retourne 400 si l'id n'est pas un UUID valide", async () => {
    // creer une session avec le role news
    const { cookie } = await createAuthSession("news");

    // utiliser un id qui n'est pas un UUID
    const res = await request(app)
      .delete("/admin/news/pas-un-uuid")
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("retourne 403 avec un role non autorise (artists)", async () => {
    // inserer une news en base
    const newsId = await insertNews();

    // creer une session avec le role artists qui n'a pas acces aux routes news
    const { cookie } = await createAuthSession("artists");

    // envoyer une requete de suppression
    const res = await request(app)
      .delete(`/admin/news/${newsId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(ERRORS.FORBIDDEN);
  });

  it("retourne 401 sans cookie", async () => {
    // inserer une news en base
    const newsId = await insertNews();

    // envoyer une requete sans cookie de session
    const res = await request(app).delete(`/admin/news/${newsId}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_MISSING_COOKIE);
  });
});
