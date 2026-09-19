import request from "supertest";
import { app } from "../../helpers/testServer";
import { auth } from "../../../src/lib/auth";
import { createAuthSession } from "../../helpers/createAuthSession";
import { insertUser } from "../../helpers/fixtures";
import {
  sendPasswordResetEmail,
  sendInviteEmail,
} from "../../../src/services/mailer.service";

/** mock des fonctions de mail */
vi.mock("../../../src/services/mailer.service", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  sendInviteEmail: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  vi.mocked(sendPasswordResetEmail).mockClear();
  vi.mocked(sendInviteEmail).mockClear();
});

const PASSWORD = "TestPassword123!";

/** Extrait le token de reinitialisation depuis l'URL generee par Better Auth
 * (.../reset-password/<token>?callbackURL=...).
 */
function extractToken(url: string): string {
  const match = url.match(/\/reset-password\/([^/?]+)/);
  if (!match) throw new Error(`Aucun token trouve dans l'URL : ${url}`);
  return match[1]!;
}

/** Tente une connexion via auth.api.signInEmail (hors HTTP, donc hors rate limit) et renvoie
 * si elle a reussi — auth.api.signInEmail lance une APIError en cas d'echec plutot que de
 * renvoyer un statut.
 */
async function canSignIn(email: string, password: string): Promise<boolean> {
  try {
    await auth.api.signInEmail({ body: { email, password } });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------

describe("POST /api/auth/sign-in/email", () => {
  it("retourne 200, un cookie de session et le role de l'utilisateur", async () => {
    const email = `sign-in-${Date.now()}@test.com`;
    await insertUser(email, "Sign In User", "admin");

    const res = await request(app)
      .post("/api/auth/sign-in/email")
      .send({ email, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("admin");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("retourne 401 avec un mauvais mot de passe", async () => {
    const email = `sign-in-bad-pwd-${Date.now()}@test.com`;
    await insertUser(email, "Sign In User", "admin");

    const res = await request(app)
      .post("/api/auth/sign-in/email")
      .send({ email, password: "MauvaisMotDePasse123!" });

    expect(res.status).toBe(401);
  });

  it("retourne 401 pour un email inconnu", async () => {
    const res = await request(app)
      .post("/api/auth/sign-in/email")
      .send({ email: "inconnu@test.com", password: PASSWORD });

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------

describe("POST /api/auth/sign-out", () => {
  it("invalide le cookie de session : get-session renvoie null ensuite", async () => {
    const { cookie } = await createAuthSession("admin");

    const signOutRes = await request(app)
      .post("/api/auth/sign-out")
      .set("Cookie", cookie);
    expect(signOutRes.status).toBe(200);

    const sessionRes = await request(app)
      .get("/api/auth/get-session")
      .set("Cookie", cookie);
    expect(sessionRes.body).toBeNull();
  });
});

// ---------------------------------------------------------------------------

describe("GET /api/auth/get-session", () => {
  it("renvoie null sans cookie", async () => {
    const res = await request(app).get("/api/auth/get-session");

    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });

  it("renvoie l'utilisateur (avec son role) pour un cookie valide", async () => {
    const { cookie, userId } = await createAuthSession("news");

    const res = await request(app)
      .get("/api/auth/get-session")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(userId);
    expect(res.body.user.role).toBe("news");
  });
});

// ---------------------------------------------------------------------------

describe("Reinitialisation du mot de passe (request-password-reset + reset-password)", () => {
  /** Ces trois tests sont volontairement les 3 SEULS appels HTTP a /api/auth/request-password-reset
  de tout le fichier : Better Auth limite ce chemin a 3 requetes / 60s (cf. commentaire de tete
  de fichier), un budget partage sur toute la duree du fichier puisque `auth` est un singleton.
  Le choix invite/reset via callbackURL est deja teste en isolation totale (sans DB ni HTTP,
  donc hors de ce budget) dans tests/unit/auth.sendResetPassword.test.ts — on se contente ici
  de verifier que le vrai endpoint HTTP est correctement branche dessus. */ 
  it("cycle complet : demande, reset, ancien mot de passe refuse, nouveau accepte, sessions revoquees", async () => {
    const email = `reset-${Date.now()}@test.com`;
    await insertUser(email, "Reset User", "admin");

    // Session ouverte avant le reset (hors HTTP, comme createAuthSession, pour ne pas toucher au
    // quota de /sign-in/email), pour verifier ensuite qu'elle est bien revoquee par le reset.
    const signInResponse = await auth.api.signInEmail({
      body: { email, password: PASSWORD },
      asResponse: true,
    });
    const existingCookie = signInResponse.headers
      .getSetCookie()[0]!
      .split(";")[0]!;

    const requestRes = await request(app)
      .post("/api/auth/request-password-reset")
      .send({ email, redirectTo: "http://localhost:3000/reset-password" });
    expect(requestRes.status).toBe(200);

    expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    const url = vi.mocked(sendPasswordResetEmail).mock.calls[0]![2];
    const token = extractToken(url);

    const newPassword = "NouveauMotDePasse123!";
    const resetRes = await request(app)
      .post("/api/auth/reset-password")
      .send({ token, newPassword });
    expect(resetRes.status).toBe(200);

    expect(await canSignIn(email, PASSWORD)).toBe(false);
    expect(await canSignIn(email, newPassword)).toBe(true);

    // revokeSessionsOnPasswordReset : la session ouverte avant le reset ne fonctionne plus
    const sessionRes = await request(app)
      .get("/api/auth/get-session")
      .set("Cookie", existingCookie);
    expect(sessionRes.body).toBeNull();
  });

  it("appelle sendInviteEmail (pas sendPasswordResetEmail) quand redirectTo contient context=invite, en HTTP reel", async () => {
    const email = `invite-${Date.now()}@test.com`;
    await insertUser(email, "Invite User", "admin");

    const res = await request(app)
      .post("/api/auth/request-password-reset")
      .send({
        email,
        redirectTo: "http://localhost:3000/reset-password?context=invite",
      });

    expect(res.status).toBe(200);
    expect(sendInviteEmail).toHaveBeenCalledTimes(1);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("retourne 200 sans envoyer d'email pour un email inconnu (pas d'enumeration d'utilisateurs)", async () => {
    const res = await request(app)
      .post("/api/auth/request-password-reset")
      .send({
        email: "personne@test.com",
        redirectTo: "http://localhost:3000/reset-password",
      });

    expect(res.status).toBe(200);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(sendInviteEmail).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------

describe("Plugin admin Better Auth (/api/auth/admin/*)", () => {
  it("retourne 401 sans cookie", async () => {
    const res = await request(app).get("/api/auth/admin/list-users");

    expect(res.status).toBe(401);
  });

  it("retourne 403 pour un role non-admin (adminRoles par defaut = [admin])", async () => {
    const { cookie } = await createAuthSession("artists");

    const res = await request(app)
      .post("/api/auth/admin/create-user")
      .set("Cookie", cookie)
      .send({
        email: `refuse-${Date.now()}@test.com`,
        password: PASSWORD,
        name: "X",
      });

    expect(res.status).toBe(403);
  });

  it("cree, liste, modifie, change le mot de passe puis supprime un utilisateur", async () => {
    const { cookie: adminCookie } = await createAuthSession("admin");
    const email = `admin-crud-${Date.now()}@test.com`;

    // creation
    const createRes = await request(app)
      .post("/api/auth/admin/create-user")
      .set("Cookie", adminCookie)
      .send({ email, password: PASSWORD, name: "CRUD User", role: "news" });
    expect(createRes.status).toBe(200);
    expect(createRes.body.user.role).toBe("news");
    const userId = createRes.body.user.id as string;

    // liste
    const listRes = await request(app)
      .get("/api/auth/admin/list-users")
      .query({ searchValue: email, searchField: "email" })
      .set("Cookie", adminCookie);
    expect(listRes.status).toBe(200);
    expect(
      listRes.body.users.some((u: { id: string }) => u.id === userId),
    ).toBe(true);

    // modification du role
    const updateRes = await request(app)
      .post("/api/auth/admin/update-user")
      .set("Cookie", adminCookie)
      .send({ userId, data: { role: "artists" } });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.role).toBe("artists");

    // changement de mot de passe
    const newPassword = "MotDePasseAdmin123!";
    const setPwdRes = await request(app)
      .post("/api/auth/admin/set-user-password")
      .set("Cookie", adminCookie)
      .send({ userId, newPassword });
    expect(setPwdRes.status).toBe(200);
    expect(await canSignIn(email, newPassword)).toBe(true);

    // suppression
    const removeRes = await request(app)
      .post("/api/auth/admin/remove-user")
      .set("Cookie", adminCookie)
      .send({ userId });
    expect(removeRes.status).toBe(200);
    expect(await canSignIn(email, newPassword)).toBe(false);
  });

  it("retourne 400 quand on tente de se supprimer soi-meme", async () => {
    const { cookie, userId } = await createAuthSession("admin");

    const res = await request(app)
      .post("/api/auth/admin/remove-user")
      .set("Cookie", cookie)
      .send({ userId });

    expect(res.status).toBe(400);
  });
});
