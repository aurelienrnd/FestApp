import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";
import { getEnv } from "../utils";
import { AppError } from "../errors/AppError";
import { ERRORS } from "../errors/errorMessages";

/** Instance partagee du transporteur SMTP — configuree une seule fois au demarrage. */
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

/** Envoie un nouveau mot de passe temporaire a l'utilisateur qui a demande la reinitialisation.
 * @param to adresse email du destinataire
 * @param displayName nom complet de l'utilisateur
 * @param tempPassword nouveau mot de passe temporaire en clair
 */
export async function sendPasswordResetEmail(
  to: string,
  displayName: string,
  tempPassword: string,
): Promise<void> {
  await sendMail({
    from: `"Vindhellfest" <${getEnv("SMTP_USER")}>`,
    to,
    subject: "Reinitialisation de votre mot de passe",
    text: `Bonjour ${displayName},\n\nVous avez demande la reinitialisation de votre mot de passe.\nVotre nouveau mot de passe provisoire : ${tempPassword}\n\nVeuillez le modifier des votre prochaine connexion.`,
  });
}

/** Transmet le message du formulaire de contact a l'adresse de l'organisation.
 * @param from adresse email de l'expediteur (visiteur)
 * @param name nom complet de l'expediteur
 * @param subject sujet du message
 * @param message contenu du message
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

/** Envoie les identifiants provisoires au nouvel utilisateur cree par un admin.
 * @param to adresse email du destinataire
 * @param displayName nom complet de l'utilisateur
 * @param tempPassword mot de passe provisoire en clair genere a la creation
 */
export async function sendWelcomeEmail(
  to: string,
  displayName: string,
  tempPassword: string,
): Promise<void> {
  await sendMail({
    from: `"Vindhellfest" <${getEnv("SMTP_USER")}>`,
    to,
    subject: "Votre compte Vindhellfest",
    text: `Bonjour ${displayName},\n\nVotre compte a ete cree.\nIdentifiant : ${to}\nMot de passe provisoire : ${tempPassword}\n\nVeuillez le modifier des votre premiere connexion.`,
  });
}
