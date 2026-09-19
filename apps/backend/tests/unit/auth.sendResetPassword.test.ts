import { auth } from "../../src/lib/auth";
import {
  sendPasswordResetEmail,
  sendInviteEmail,
} from "../../src/services/mailer.service";

/** betterAuth() renvoie l'objet options tel quel (cf. node_modules/better-auth/dist/auth/base.mjs,
 * createBetterAuth retourne { ..., options } sans le transformer) : auth.options.emailAndPassword
 * .sendResetPassword EST la fonction ecrite dans auth.ts, appelable directement sans DB, sans
 * HTTP, sans rate limiter. Complement isole de la couverture d'integration (betterAuth.test.ts),
 * qui exerce la meme fonction via de vraies requetes /api/auth/request-password-reset.
 */
vi.mock("../../src/services/mailer.service", () => ({
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  sendInviteEmail: vi.fn().mockResolvedValue(undefined),
}));

const sendResetPassword = auth.options.emailAndPassword!.sendResetPassword!;

beforeEach(() => {
  vi.mocked(sendPasswordResetEmail).mockClear();
  vi.mocked(sendInviteEmail).mockClear();
});

const user = { email: "user@test.com", name: "Jean Dupont" } as Parameters<
  typeof sendResetPassword
>[0]["user"];

const baseUrl = (callbackURL?: string) =>
  `http://localhost:4000/api/auth/reset-password/tok123${
    callbackURL ? `?callbackURL=${encodeURIComponent(callbackURL)}` : ""
  }`;

// ---------------------------------------------------------------------------

describe("sendResetPassword (src/lib/auth.ts)", () => {
  it("appelle sendInviteEmail quand callbackURL contient context=invite", async () => {
    const url = baseUrl("http://localhost:3000/reset-password?context=invite");

    await sendResetPassword({ user, url, token: "tok123" });

    expect(sendInviteEmail).toHaveBeenCalledWith(user.email, user.name, url);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("appelle sendPasswordResetEmail quand callbackURL n'a pas de context", async () => {
    const url = baseUrl("http://localhost:3000/reset-password");

    await sendResetPassword({ user, url, token: "tok123" });

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      user.email,
      user.name,
      url,
    );
    expect(sendInviteEmail).not.toHaveBeenCalled();
  });

  it("appelle sendPasswordResetEmail quand callbackURL a un context different de invite", async () => {
    const url = baseUrl("http://localhost:3000/reset-password?context=autre");

    await sendResetPassword({ user, url, token: "tok123" });

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      user.email,
      user.name,
      url,
    );
    expect(sendInviteEmail).not.toHaveBeenCalled();
  });

  it("appelle sendPasswordResetEmail quand l'URL n'a pas de callbackURL du tout", async () => {
    const url = baseUrl();

    await sendResetPassword({ user, url, token: "tok123" });

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      user.email,
      user.name,
      url,
    );
    expect(sendInviteEmail).not.toHaveBeenCalled();
  });
});
