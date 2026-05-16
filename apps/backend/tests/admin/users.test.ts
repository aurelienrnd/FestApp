import request from "supertest";
import { app } from "../helpers/testServer";
import { createAuthSession } from "../helpers/createAuthSession";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";

// corps valide pour la creation d'un utilisateur
const VALID_USER_BODY = {
  email: "newuser@test.com",
  first_name: "Jean",
  last_name: "Dupont",
  role: "news" as const,
};

/** Insere un utilisateur directement en base et retourne son id.
 * @param email email unique de l'utilisateur
 * @param displayName nom affiche de l'utilisateur
 */
async function insertUser(email: string, displayName: string): Promise<string> {
  // inserer un utilisateur en base
  const users = await query<{ id: string }>(
    `INSERT INTO users (email, password_hash, display_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [email, "hashed-password", displayName, "news"],
  );
  return users[0].id;
}

// ---------------------------------------------------------------------------

describe("GET /admin/users", () => {
  it("retourne 200 et la liste des utilisateurs", async () => {
    // inserer deux utilisateurs en base
    await insertUser("user1@test.com", "User Un");
    await insertUser("user2@test.com", "User Deux");

    // creer une session admin
    const { cookie } = await createAuthSession("admin");

    // recuperer la liste des utilisateurs
    const res = await request(app).get("/admin/users").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    // au moins les 2 inseres + le user cree par createAuthSession
    expect(res.body.users.length).toBeGreaterThanOrEqual(2);
  });

  it("retourne 403 avec un role non autorise (news)", async () => {
    // creer une session avec le role news qui n'a pas acces aux routes users
    const { cookie } = await createAuthSession("news");

    // tenter de recuperer la liste des utilisateurs avec un role non autorise
    const res = await request(app).get("/admin/users").set("Cookie", cookie);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(ERRORS.FORBIDDEN);
  });

  it("retourne 401 sans cookie", async () => {
    // envoyer une requete sans cookie de session
    const res = await request(app).get("/admin/users");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_MISSING_COOKIE);
  });
});

// ---------------------------------------------------------------------------

describe("POST /admin/users", () => {
  it("retourne 201 et cree un utilisateur", async () => {
    // creer une session admin
    const { cookie } = await createAuthSession("admin");

    // creer un utilisateur avec les bons champs
    const res = await request(app)
      .post("/admin/users")
      .set("Cookie", cookie)
      .send(VALID_USER_BODY);

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(VALID_USER_BODY.email);
    expect(res.body.user.display_name).toBe("Jean Dupont");
  });

  it("retourne 409 si l'email est deja utilise", async () => {
    // inserer un utilisateur avec l'email qu'on va tenter de reutiliser
    await insertUser(VALID_USER_BODY.email, "Existant");

    // creer une session admin
    const { cookie } = await createAuthSession("admin");

    // tenter de creer un utilisateur avec le meme email
    const res = await request(app)
      .post("/admin/users")
      .set("Cookie", cookie)
      .send(VALID_USER_BODY);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe(ERRORS.USER_EMAIL_ALREADY_USED);
  });

  it("retourne 409 si le display_name est deja utilise", async () => {
    // inserer un utilisateur avec le meme display_name que celui qu'on va tenter de creer
    await insertUser("autre@test.com", "Jean Dupont");

    // creer une session admin
    const { cookie } = await createAuthSession("admin");

    // tenter de creer un utilisateur avec le meme prenom/nom (display_name identique)
    const res = await request(app)
      .post("/admin/users")
      .set("Cookie", cookie)
      .send(VALID_USER_BODY);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe(ERRORS.USER_DISPLAY_NAME_ALREADY_USED);
  });

  it("retourne 400 si le body est invalide", async () => {
    // creer une session admin
    const { cookie } = await createAuthSession("admin");

    // envoyer un body avec un email invalide et un role inexistant
    const res = await request(app)
      .post("/admin/users")
      .set("Cookie", cookie)
      .send({
        email: "pas-un-email",
        first_name: "A",
        last_name: "B",
        role: "inconnu",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
  });

  it("retourne 403 avec un role non autorise (news)", async () => {
    // creer une session avec le role news qui n'a pas acces aux routes users
    const { cookie } = await createAuthSession("news");

    // tenter de creer un utilisateur avec un role non autorise
    const res = await request(app)
      .post("/admin/users")
      .set("Cookie", cookie)
      .send(VALID_USER_BODY);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(ERRORS.FORBIDDEN);
  });

  it("retourne 401 sans cookie", async () => {
    // envoyer une requete sans cookie de session
    const res = await request(app).post("/admin/users").send(VALID_USER_BODY);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_MISSING_COOKIE);
  });
});

// ---------------------------------------------------------------------------

describe("PATCH /admin/users/:id", () => {
  it("retourne 200 et modifie l'utilisateur", async () => {
    // inserer un utilisateur en base
    const userId = await insertUser("update-me@test.com", "A Modifier");

    // creer une session admin
    const { cookie } = await createAuthSession("admin");

    // modifier l'utilisateur avec de nouveaux champs
    const res = await request(app)
      .patch(`/admin/users/${userId}`)
      .set("Cookie", cookie)
      .send({
        email: "updated@test.com",
        first_name: "Nouveau",
        last_name: "Nom",
        role: "artists",
      });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("updated@test.com");
    expect(res.body.user.display_name).toBe("Nouveau Nom");
  });

  it("retourne 404 si l'utilisateur n'existe pas", async () => {
    // creer une session admin
    const { cookie } = await createAuthSession("admin");

    // utiliser un uuid valide mais inexistant en base
    const res = await request(app)
      .patch("/admin/users/00000000-0000-0000-0000-000000000000")
      .set("Cookie", cookie)
      .send(VALID_USER_BODY);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.USER_NOT_FOUND);
  });

  it("retourne 400 si l'id n'est pas un UUID valide", async () => {
    // creer une session admin
    const { cookie } = await createAuthSession("admin");

    // utiliser un id qui n'est pas un UUID
    const res = await request(app)
      .patch("/admin/users/pas-un-uuid")
      .set("Cookie", cookie)
      .send(VALID_USER_BODY);

    expect(res.status).toBe(400);
  });

  it("retourne 400 si le body est invalide", async () => {
    // inserer un utilisateur en base
    const userId = await insertUser("patch-invalid@test.com", "Patch Invalid");

    // creer une session admin
    const { cookie } = await createAuthSession("admin");

    // envoyer un body avec un role invalide
    const res = await request(app)
      .patch(`/admin/users/${userId}`)
      .set("Cookie", cookie)
      .send({
        email: "ok@test.com",
        first_name: "Ok",
        last_name: "Ok",
        role: "inconnu",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
  });

  it("retourne 403 avec un role non autorise (artists)", async () => {
    // inserer un utilisateur en base
    const userId = await insertUser(
      "patch-forbidden@test.com",
      "Patch Forbidden",
    );

    // creer une session avec le role artists qui n'a pas acces aux routes users
    const { cookie } = await createAuthSession("artists");

    // tenter de modifier un utilisateur avec un role non autorise
    const res = await request(app)
      .patch(`/admin/users/${userId}`)
      .set("Cookie", cookie)
      .send(VALID_USER_BODY);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(ERRORS.FORBIDDEN);
  });

  it("retourne 401 sans cookie", async () => {
    // inserer un utilisateur en base
    const userId = await insertUser("patch-noauth@test.com", "Patch Noauth");

    // envoyer une requete sans cookie de session
    const res = await request(app)
      .patch(`/admin/users/${userId}`)
      .send(VALID_USER_BODY);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_MISSING_COOKIE);
  });
});

// ---------------------------------------------------------------------------

describe("DELETE /admin/users/:id", () => {
  it("retourne 200 et supprime l'utilisateur", async () => {
    // inserer un utilisateur en base
    const userId = await insertUser("delete-me@test.com", "A Supprimer");

    // creer une session admin
    const { cookie } = await createAuthSession("admin");

    // supprimer l'utilisateur
    const res = await request(app)
      .delete(`/admin/users/${userId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
  });

  it("retourne 404 si l'utilisateur n'existe pas", async () => {
    // creer une session admin
    const { cookie } = await createAuthSession("admin");

    // utiliser un uuid valide mais inexistant en base
    const res = await request(app)
      .delete("/admin/users/00000000-0000-0000-0000-000000000000")
      .set("Cookie", cookie);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.USER_NOT_FOUND);
  });

  it("retourne 400 si l'id n'est pas un UUID valide", async () => {
    // creer une session admin
    const { cookie } = await createAuthSession("admin");

    // utiliser un id qui n'est pas un UUID
    const res = await request(app)
      .delete("/admin/users/pas-un-uuid")
      .set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("retourne 403 avec un role non autorise (artists)", async () => {
    // inserer un utilisateur en base
    const userId = await insertUser(
      "delete-forbidden@test.com",
      "Delete Forbidden",
    );

    // creer une session avec le role artists qui n'a pas acces aux routes users
    const { cookie } = await createAuthSession("artists");

    // tenter de supprimer un utilisateur avec un role non autorise
    const res = await request(app)
      .delete(`/admin/users/${userId}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(ERRORS.FORBIDDEN);
  });

  it("retourne 401 sans cookie", async () => {
    // inserer un utilisateur en base
    const userId = await insertUser("delete-noauth@test.com", "Delete Noauth");

    // envoyer une requete sans cookie de session
    const res = await request(app).delete(`/admin/users/${userId}`);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_MISSING_COOKIE);
  });
});
