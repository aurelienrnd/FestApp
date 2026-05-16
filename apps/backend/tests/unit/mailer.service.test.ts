import nodemailer from "nodemailer";
import {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendContactEmail,
} from "../../src/services/mailer.service";

// Recupere sendMail depuis le transporter cree par le service au chargement du module.
let sendMailMock: ReturnType<typeof vi.fn>;
beforeAll(() => {
  sendMailMock = vi.mocked(nodemailer.createTransport).mock.results[0].value
    .sendMail;
});

// ---------------------------------------------------------------------------

describe("sendPasswordResetEmail", () => {
  it("appelle sendMail avec le bon destinataire et le mot de passe dans le body", async () => {
    // Appelle la fonction avec des valeurs de test
    await sendPasswordResetEmail("user@test.com", "Jean Dupont", "tmp123abc");

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@test.com",
        subject: expect.stringContaining("mot de passe"),
        text: expect.stringContaining("tmp123abc"),
      }),
    );
  });

  it("inclut le nom de l'utilisateur dans le corps du mail", async () => {
    // Appelle la fonction avec des valeurs de test
    await sendPasswordResetEmail("user@test.com", "Jean Dupont", "tmp123abc");

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("Jean Dupont"),
      }),
    );
  });
});

// ---------------------------------------------------------------------------

describe("sendWelcomeEmail", () => {
  it("appelle sendMail avec le bon destinataire et les identifiants dans le body", async () => {
    // Appelle la fonction avec des valeurs de test
    await sendWelcomeEmail("new@test.com", "Marie Martin", "init456def");

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "new@test.com",
        text: expect.stringContaining("init456def"),
      }),
    );
  });

  it("inclut le nom de l'utilisateur dans le corps du mail", async () => {
    // Appelle la fonction avec des valeurs de test
    await sendWelcomeEmail("new@test.com", "Marie Martin", "init456def");

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("Marie Martin"),
      }),
    );
  });

  it("inclut l'email comme identifiant de connexion dans le corps du mail", async () => {
    // Appelle la fonction avec des valeurs de test
    await sendWelcomeEmail("new@test.com", "Marie Martin", "init456def");

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("new@test.com"),
      }),
    );
  });
});

// ---------------------------------------------------------------------------

describe("sendContactEmail", () => {
  it("appelle sendMail avec le sujet prefixe [Contact]", async () => {
    // Appelle la fonction avec des valeurs de test
    await sendContactEmail(
      "visiteur@exemple.com",
      "Paul Visiteur",
      "Question horaires",
      "Bonjour, quels sont vos horaires ?",
    );

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining("[Contact]"),
      }),
    );
  });

  it("appelle sendMail avec replyTo egal a l'email de l'expediteur", async () => {
    // Appelle la fonction avec des valeurs de test
    await sendContactEmail(
      "visiteur@exemple.com",
      "Paul Visiteur",
      "Question horaires",
      "Bonjour, quels sont vos horaires ?",
    );

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: "visiteur@exemple.com",
      }),
    );
  });

  it("inclut le nom et l'email de l'expediteur dans le corps du mail", async () => {
    // Appelle la fonction avec des valeurs de test
    await sendContactEmail(
      "visiteur@exemple.com",
      "Paul Visiteur",
      "Question horaires",
      "Bonjour, quels sont vos horaires ?",
    );

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("Paul Visiteur"),
      }),
    );
  });
});
