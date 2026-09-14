import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";
import { getEnv } from "../utils.js";
import { AppError } from "../errors/AppError.js";
import { ERRORS } from "../errors/errorMessages.js";

/** Instance partagee du transporteur SMTP — configuree une seule fois au demarrage.
 * @function getEnv
 */
const transporter = nodemailer.createTransport({
  host: getEnv("SMTP_HOST"),
  port: Number(getEnv("SMTP_PORT")),
  secure: getEnv("SMTP_SECURE") === "true",
  auth: {
    user: getEnv("SMTP_USER"),
    pass: getEnv("SMTP_PASS"),
  },
});

/** Envoie un email via le transporteur SMTP et convertit toute erreur en AppError.
 * @param options options de l'email a envoyer (destinataire, sujet, corps...)
 */
async function sendMail(options: SendMailOptions): Promise<void> {
  try {
    await transporter.sendMail(options);
  } catch {
    throw new AppError(ERRORS.MAIL_SEND_ERROR, 500);
  }
}

/** Envoie le lien de reinitialisation de mot de passe a l'utilisateur qui en a fait la demande.
 * Le lien pointe vers Better Auth (GET /api/auth/reset-password/<token>), qui valide le token
 * puis redirige vers la page /reset-password du front. Aucun mot de passe n'est transmis.
 * @param to adresse email du destinataire
 * @param name nom complet de l'utilisateur
 * @param resetUrl lien de reinitialisation genere par Better Auth (token a usage unique, valable 1 h)
 * @function sendMail Envoie un email via le transporteur SMTP
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string,
): Promise<void> {
  await sendMail({
    from: `"Vindhellfest" <${getEnv("SMTP_USER")}>`,
    to,
    subject: "Reinitialisation de votre mot de passe",
    text: `Bonjour ${name},\n\nVous avez demande la reinitialisation de votre mot de passe.\nOuvrez ce lien pour en choisir un nouveau :\n${resetUrl}\n\nCe lien est valable 1 heure et ne peut servir qu'une seule fois.\nSi vous n'etes pas a l'origine de cette demande, ignorez cet email : votre mot de passe reste inchange.`,
    html: `<p>Bonjour ${name},</p>
<p>Vous avez demande la reinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau :</p>
<p><a href="${resetUrl}">Reinitialiser mon mot de passe</a></p>
<p>Ce lien est valable 1 heure et ne peut servir qu'une seule fois.</p>
<p>Si vous n'etes pas a l'origine de cette demande, ignorez cet email : votre mot de passe reste inchange.</p>`,
  });
}

/** Transmet le message du formulaire de contact a l'adresse de l'organisation.
 * @param from adresse email de l'expediteur (visiteur)
 * @param name nom complet de l'expediteur
 * @param subject sujet du message
 * @param message contenu du message
 * @function sendMail Envoie un email via le transporteur SMTP
 */
export async function sendContactEmail(
  from: string,
  name: string,
  subject: string,
  message: string,
): Promise<void> {
  await sendMail({
    from: `"Vindhellfest" <${getEnv("SMTP_USER")}>`,
    to: getEnv("CONTACT_EMAIL"),
    replyTo: from,
    subject: `[Contact] ${subject}`,
    text: `Message de : ${name} <${from}>\n\n${message}`,
  });
}
