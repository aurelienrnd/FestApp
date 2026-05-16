import request from "supertest";
import bcrypt from "bcrypt";
import { app } from "../helpers/testServer";
import { createAuthSession } from "../helpers/createAuthSession";
import { insertUser } from "../helpers/fixtures";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";

// definition d'un mot de passe commun pour les tests et son hash
const PASSWORD = "TestPassword123";
let passwordHash: string;

// on hash le mot de passe une fois pour tous les tests
beforeAll(async () => {
  passwordHash = await bcrypt.hash(PASSWORD, 10);
});

// ---------------------------------------------------------------------------

describe("POST /admin/auth/login", () => {
  it("retourne 200 et un cookie avec les bons credentials", async () => {
    // creer un user de test avec un vrai hash bcrypt pour que bcrypt.compare retourne true
    const email = "login-ok@test.com";
    await insertUser(email, "Test User", "admin", passwordHash);

    // test de ci connecte avec le bon mot de passe
    const res = await request(app)
      .post("/admin/auth/login")
      .send({ email, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("retourne 401 avec un mauvais mot de passe", async () => {
    // creer un user de test avec un vrai hash bcrypt
    const email = "login-badpwd@test.com";
    await insertUser(email, "Test User", "admin", passwordHash);

    // test de ci connecte avec le mauvais mot de passe
    const res = await request(app)
      .post("/admin/auth/login")
      .send({ email, password: "MauvaisMotDePasse123" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_INVALID_CREDENTIALS);
  });

  it("retourne 401 avec un email inexistant", async () => {
    // test de ce connecte avec un email qui n'existe pas en base
    const res = await request(app)
      .post("/admin/auth/login")
      .send({ email: "inexistant@test.com", password: PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_INVALID_CREDENTIALS);
  });

  it("retourne 400 si le body est invalide", async () => {
    // test de ci connecte avec un mail et mot de passe qui ne respectent pas les regles de validation (email non valide, mot de passe trop court)
    const res = await request(app)
      .post("/admin/auth/login")
      .send({ email: "pas-un-email", password: "court" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
  });
});

// ---------------------------------------------------------------------------

describe("POST /admin/auth/logout", () => {
  it("retourne 200 et revoque la session", async () => {
    // creer une session de test
    const { cookie } = await createAuthSession("admin");

    // test de la deconnexion avec le cookie de session
    const res = await request(app)
      .post("/admin/auth/logout")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
  });

  it("retourne 401 sans cookie", async () => {
    // test de la deconnexion sans le cookie de session
    const res = await request(app).post("/admin/auth/logout");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_MISSING_COOKIE);
  });
});

// ---------------------------------------------------------------------------

describe("GET /admin/auth/me", () => {
  it("retourne 200 et les infos du user connecte", async () => {
    // creer une session de test
    const { cookie } = await createAuthSession("admin");

    // test de la route me avec le cookie de session
    const res = await request(app).get("/admin/auth/me").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.mustChangePassword).toBeDefined();
  });

  it("retourne 401 sans cookie", async () => {
    // test de la route me sans le cookie de session
    const res = await request(app).get("/admin/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_MISSING_COOKIE);
  });

  it("retourne 401 avec une session revoquee", async () => {
    // creer une session de test
    const { cookie, userId } = await createAuthSession("admin");

    // revoque la session en base
    await query("UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1", [
      userId,
    ]);

    // test de la route me avec le cookie de session revoquee
    const res = await request(app).get("/admin/auth/me").set("Cookie", cookie);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.SESSION_ALREADY_CLOSED);
  });

  it("retourne 401 avec une session expiree", async () => {
    // creer une session de test
    const { cookie, userId } = await createAuthSession("admin");

    // expire la session en base : created_at recule a -2h pour que expires_at (-1h) reste > created_at
    await query(
      "UPDATE sessions SET created_at = NOW() - INTERVAL '2 hours', expires_at = NOW() - INTERVAL '1 hour' WHERE user_id = $1",
      [userId],
    );

    // test de la route me avec le cookie de session expiree
    const res = await request(app).get("/admin/auth/me").set("Cookie", cookie);

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.SESSION_ALREADY_CLOSED);
  });
});

// ---------------------------------------------------------------------------

describe("POST /admin/auth/forgot-password", () => {
  it("retourne 200 et envoie un email si l'email existe", async () => {
    // creer un user de test (le hash n'est pas verifie par forgot-password)
    const email = "forgot-ok@test.com";
    await insertUser(email, "Test User", "admin");

    // test de la route forgot-password avec un email qui existe en base
    const res = await request(app)
      .post("/admin/auth/forgot-password")
      .send({ email });

    expect(res.status).toBe(200);
  });

  it("retourne 404 si l'email n'existe pas", async () => {
    // test de la route forgot-password avec un email qui n'existe pas en base
    const res = await request(app)
      .post("/admin/auth/forgot-password")
      .send({ email: "inconnu@test.com" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.AUTH_EMAIL_NOT_FOUND);
  });

  it("retourne 400 si le body est invalide", async () => {
    // test de la route forgot-password avec un body qui ne respecte pas les regles de validation (email non valide)
    const res = await request(app)
      .post("/admin/auth/forgot-password")
      .send({ email: "pas-un-email" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
  });
});

// ---------------------------------------------------------------------------

describe("PATCH /admin/auth/password", () => {
  it("retourne 200 et met a jour le mot de passe", async () => {
    // creer une session de test
    const { cookie, userId } = await createAuthSession("admin");

    // createAuthSession insere "hashed-password" (placeholder) — remplacer par un vrai hash bcrypt
    // pour que bcrypt.compare(PASSWORD, hash) retourne true dans le controleur
    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      passwordHash,
      userId,
    ]);

    // test de la route de changement de mot de passe avec le cookie de session et les bons anciens et nouveaux mots de passe
    const res = await request(app)
      .patch("/admin/auth/password")
      .set("Cookie", cookie)
      .send({ password: PASSWORD, newPassword: "NouveauMotDePasse123" });

    expect(res.status).toBe(200);
  });

  it("retourne 401 si l'ancien mot de passe est incorrect", async () => {
    // creer une session de test
    const { cookie } = await createAuthSession("admin");

    // test de la route de changement de mot de passe avec le cookie de session et un ancien mot de passe incorrect
    const res = await request(app)
      .patch("/admin/auth/password")
      .set("Cookie", cookie)
      .send({
        password: "MauvaisAncien123",
        newPassword: "NouveauMotDePasse123",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_WRONG_PASSWORD);
  });

  it("retourne 400 si le body est invalide", async () => {
    // creer une session de test
    const { cookie } = await createAuthSession("admin");

    // test de la route de changement de mot de passe avec le cookie de session et un body qui ne respecte pas les regles de validation (nouveau mot de passe trop court)
    const res = await request(app)
      .patch("/admin/auth/password")
      .set("Cookie", cookie)
      .send({ password: "court", newPassword: "court" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
  });

  it("retourne 401 sans cookie", async () => {
    // test de la route de changement de mot de passe sans le cookie de session
    const res = await request(app)
      .patch("/admin/auth/password")
      .send({ password: PASSWORD, newPassword: "NouveauMotDePasse123" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe(ERRORS.AUTH_MISSING_COOKIE);
  });
});
