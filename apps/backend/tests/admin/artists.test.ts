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

// champs valides pour la creation d'un artiste (sans image)
const VALID_ARTIST_FIELDS = {
  name: "Test Artist",
  genre: "Metal",
  origin: "France",
  bio: "Une biographie de test suffisamment longue.",
  description_media: "Photo de scene",
  stage: "MainStage",
  start_time: "2025-08-01T18:00:00.000Z",
  end_time: "2025-08-01T19:00:00.000Z",
};

// compteur local pour generer des creneaux uniques et eviter deux concerts au meme moment lors de l'insertion d'artistes en base dans les tests
let artistCounter = 0;

/** Insere un artiste et son concert directement en base et retourne son id.
 * Chaque appel utilise un creneau de 2h.
 * @param isFeatured si l'artiste est mis en avant sur la home
 */
async function insertArtist(isFeatured = false): Promise<string> {
  const slot = artistCounter++;
  // creneaux de 2h a partir de minuit le 1er aout — pas de modulo, end toujours > start
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
      `Artist DB ${slot}`,
      "Metal",
      "France",
      "Bio",
      "/uploads/artists/test.webp",
      "Photo",
      isFeatured,
    ],
  );
  const artistId = artists[0].id;

  // inserer un concert pour l'artiste en base
  await query(
    `INSERT INTO concerts (artist_id, stage, start_time, end_time)
     VALUES ($1, $2, $3, $4)`,
    [artistId, "MainStage", startTime, endTime],
  );

  return artistId;
}

// ---------------------------------------------------------------------------

describe("POST /admin/artists", () => {
  it("retourne 201 et cree un artiste avec les bons champs", async () => {
    // creer une session admin avec le role artists
    const { cookie } = await createAuthSession("artists");

    // envoyer une requete multipart avec les champs et l'image
    const res = await request(app)
      .post("/admin/artists")
      .set("Cookie", cookie)
      .field("name", VALID_ARTIST_FIELDS.name)
      .field("genre", VALID_ARTIST_FIELDS.genre)
      .field("origin", VALID_ARTIST_FIELDS.origin)
      .field("bio", VALID_ARTIST_FIELDS.bio)
      .field("description_media", VALID_ARTIST_FIELDS.description_media)
      .field("stage", VALID_ARTIST_FIELDS.stage)
      .field("start_time", VALID_ARTIST_FIELDS.start_time)
      .field("end_time", VALID_ARTIST_FIELDS.end_time)
      .attach("image", MINIMAL_PNG, "image.png");

    expect(res.status).toBe(201);
    expect(res.body.artist).toBeDefined();
    expect(res.body.artist.name).toBe(VALID_ARTIST_FIELDS.name);
  });

  it("retourne 400 si aucune image n'est fournie", async () => {
    // creer une session admin avec le role artists
    const { cookie } = await createAuthSession("artists");

    // envoyer une requete sans fichier image
    const res = await request(app)
      .post("/admin/artists")
      .set("Cookie", cookie)
      .field("name", VALID_ARTIST_FIELDS.name)
      .field("genre", VALID_ARTIST_FIELDS.genre)
      .field("origin", VALID_ARTIST_FIELDS.origin)
      .field("bio", VALID_ARTIST_FIELDS.bio)
      .field("description_media", VALID_ARTIST_FIELDS.description_media)
      .field("stage", VALID_ARTIST_FIELDS.stage)
      .field("start_time", VALID_ARTIST_FIELDS.start_time)
      .field("end_time", VALID_ARTIST_FIELDS.end_time);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.ARTIST_FILE_REQUIRED);
  });

  it("retourne 400 si le body est invalide", async () => {
    // creer une session admin avec le role artists
    const { cookie } = await createAuthSession("artists");

    // envoyer une requete avec un champ name manquant et un stage invalide
    const res = await request(app)
      .post("/admin/artists")
      .set("Cookie", cookie)
      .field("genre", VALID_ARTIST_FIELDS.genre)
      .field("stage", "ScenesInexistante")
      .attach("image", MINIMAL_PNG, "image.png");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
  });

  it("retourne 409 si la limite de 2 artistes en avant est atteinte", async () => {
    // creer deux artistes deja mis en avant en base
    await insertArtist(true);
    await insertArtist(true);

    // creer une session admin avec le role artists
    const { cookie } = await createAuthSession("artists");

    // tenter de creer un 3e artiste avec is_featured=true
    const res = await request(app)
      .post("/admin/artists")
      .set("Cookie", cookie)
      .field("name", VALID_ARTIST_FIELDS.name)
      .field("genre", VALID_ARTIST_FIELDS.genre)
      .field("origin", VALID_ARTIST_FIELDS.origin)
      .field("bio", VALID_ARTIST_FIELDS.bio)
      .field("description_media", VALID_ARTIST_FIELDS.description_media)
      .field("stage", VALID_ARTIST_FIELDS.stage)
      .field("start_time", VALID_ARTIST_FIELDS.start_time)
      .field("end_time", VALID_ARTIST_FIELDS.end_time)
      .field("is_featured", "true")
      .attach("image", MINIMAL_PNG, "image.png");

    expect(res.status).toBe(409);
    expect(res.body.error).toBe(ERRORS.ARTIST_FEATURED_LIMIT);
  });

  it("retourne 403 avec un role non autorise (news)", async () => {
    // creer une session avec le role news qui n'a pas acces aux routes artistes
    const { cookie } = await createAuthSession("news");

    // envoyer une requete multipart avec les champs et l'image
    const res = await request(app)
      .post("/admin/artists")
      .set("Cookie", cookie)
      .field("name", VALID_ARTIST_FIELDS.name)
      .attach("image", MINIMAL_PNG, "image.png");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(ERRORS.FORBIDDEN);
  });

  it("retourne 401 sans cookie", async () => {
    // envoyer une requete sans cookie de session
    const res = await request(app)
      .post("/admin/artists")
      .field("name", VALID_ARTIST_FIELDS.name)
      .attach("image", MINIMAL_PNG, "image.png");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_MISSING_COOKIE);
  });
});

// ---------------------------------------------------------------------------

describe("PATCH /admin/artists/:id", () => {
  it("retourne 200 et modifie l'artiste", async () => {
    // inserer un artiste en base
    const artistId = await insertArtist();

    // creer une session avec le role artists
    const { cookie } = await createAuthSession("artists");

    // modifier l'artiste avec un nouveau nom
    const res = await request(app)
      .patch(`/admin/artists/${artistId}`)
      .set("Cookie", cookie)
      .field("name", "Nouveau Nom")
      .field("genre", VALID_ARTIST_FIELDS.genre)
      .field("origin", VALID_ARTIST_FIELDS.origin)
      .field("bio", VALID_ARTIST_FIELDS.bio)
      .field("description_media", VALID_ARTIST_FIELDS.description_media)
      .field("stage", VALID_ARTIST_FIELDS.stage)
      .field("start_time", VALID_ARTIST_FIELDS.start_time)
      .field("end_time", VALID_ARTIST_FIELDS.end_time);

    expect(res.status).toBe(200);
    expect(res.body.artist.name).toBe("Nouveau Nom");
  });

  it("retourne 200 et modifie l'artiste avec une nouvelle image", async () => {
    // inserer un artiste en base
    const artistId = await insertArtist();

    // creer une session avec le role artists
    const { cookie } = await createAuthSession("artists");

    // modifier l'artiste en fournissant une nouvelle image
    const res = await request(app)
      .patch(`/admin/artists/${artistId}`)
      .set("Cookie", cookie)
      .field("name", VALID_ARTIST_FIELDS.name)
      .field("genre", VALID_ARTIST_FIELDS.genre)
      .field("origin", VALID_ARTIST_FIELDS.origin)
      .field("bio", VALID_ARTIST_FIELDS.bio)
      .field("description_media", VALID_ARTIST_FIELDS.description_media)
      .field("stage", VALID_ARTIST_FIELDS.stage)
      .field("start_time", VALID_ARTIST_FIELDS.start_time)
      .field("end_time", VALID_ARTIST_FIELDS.end_time)
      .attach("image", MINIMAL_PNG, "image.png");

    expect(res.status).toBe(200);
    expect(res.body.artist).toBeDefined();
  });

  it("retourne 404 si l'artiste n'existe pas", async () => {
    // creer une session avec le role artists
    const { cookie } = await createAuthSession("artists");

    // utiliser un uuid valide mais inexistant en base
    const res = await request(app)
      .patch("/admin/artists/00000000-0000-0000-0000-000000000000")
      .set("Cookie", cookie)
      .field("name", VALID_ARTIST_FIELDS.name)
      .field("genre", VALID_ARTIST_FIELDS.genre)
      .field("origin", VALID_ARTIST_FIELDS.origin)
      .field("bio", VALID_ARTIST_FIELDS.bio)
      .field("description_media", VALID_ARTIST_FIELDS.description_media)
      .field("stage", VALID_ARTIST_FIELDS.stage)
      .field("start_time", VALID_ARTIST_FIELDS.start_time)
      .field("end_time", VALID_ARTIST_FIELDS.end_time);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.ARTIST_NOT_FOUND);
  });

  it("retourne 400 si l'id n'est pas un UUID valide", async () => {
    // creer une session avec le role artists
    const { cookie } = await createAuthSession("artists");

    // utiliser un id qui n'est pas un UUID
    const res = await request(app)
      .patch("/admin/artists/pas-un-uuid")
      .set("Cookie", cookie)
      .field("name", VALID_ARTIST_FIELDS.name)
      .field("stage", VALID_ARTIST_FIELDS.stage)
      .field("start_time", VALID_ARTIST_FIELDS.start_time)
      .field("end_time", VALID_ARTIST_FIELDS.end_time);

    expect(res.status).toBe(400);
  });

  it("retourne 403 avec un role non autorise (news)", async () => {
    // inserer un artiste en base
    const artistId = await insertArtist();

    // creer une session avec le role news qui n'a pas acces aux routes artistes
    const { cookie } = await createAuthSession("news");

    // envoyer une requete multipart avec les champs et l'image
    const res = await request(app)
      .patch(`/admin/artists/${artistId}`)
      .set("Cookie", cookie)
      .field("name", VALID_ARTIST_FIELDS.name);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(ERRORS.FORBIDDEN);
  });

  it("retourne 401 sans cookie", async () => {
    // inserer un artiste en base
    const artistId = await insertArtist();

    // envoyer une requete sans cookie de session
    const res = await request(app)
      .patch(`/admin/artists/${artistId}`)
      .field("name", VALID_ARTIST_FIELDS.name);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_MISSING_COOKIE);
  });
});

// ---------------------------------------------------------------------------

describe("DELETE /admin/artists/:id", () => {
  it("retourne 200 et supprime l'artiste", async () => {
    // inserer un artiste en base
    const artistId = await insertArtist();

    // creer une session avec le role artists
    const { cookie } = await createAuthSession("artists");

    // supprimer l'artiste
    const res = await request(app)
      .delete(`/admin/artists/${artistId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
  });

  it("retourne 404 si l'artiste n'existe pas", async () => {
    // creer une session avec le role artists
    const { cookie } = await createAuthSession("artists");

    // utiliser un uuid valide mais inexistant en base
    const res = await request(app)
      .delete("/admin/artists/00000000-0000-0000-0000-000000000000")
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.ARTIST_NOT_FOUND);
  });

  it("retourne 400 si l'id n'est pas un UUID valide", async () => {
    // creer une session avec le role artists
    const { cookie } = await createAuthSession("artists");

    // utiliser un id qui n'est pas un UUID
    const res = await request(app)
      .delete("/admin/artists/pas-un-uuid")
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("retourne 403 avec un role non autorise (news)", async () => {
    // inserer un artiste en base
    const artistId = await insertArtist();

    // creer une session avec le role news qui n'a pas acces aux routes artistes
    const { cookie } = await createAuthSession("news");

    // envoyer une requete de suppression
    const res = await request(app)
      .delete(`/admin/artists/${artistId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(ERRORS.FORBIDDEN);
  });

  it("retourne 401 sans cookie", async () => {
    // inserer un artiste en base
    const artistId = await insertArtist();

    // envoyer une requete sans cookie de session
    const res = await request(app).delete(`/admin/artists/${artistId}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_MISSING_COOKIE);
  });
});
