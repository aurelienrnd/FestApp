import nodemailer from "nodemailer";
import { getEnv } from "../functions";

/** Cree et retourne un transporteur SMTP configure depuis les variables d'environnement */
function createTransporter() {
  return nodemailer.createTransport({
    host: getEnv("SMTP_HOST"),
    port: Number(getEnv("SMTP_PORT")),
    auth: {
      user: getEnv("SMTP_USER"),
      pass: getEnv("SMTP_PASS"),
    },
  });
}

/** Envoie un nouveau mot de passe temporaire a l'utilisateur qui a demande la reinitialisation.
 * @param {string} to adresse email du destinataire
 * @param {string} displayName nom complet de l'utilisateur
 * @param {string} tempPassword nouveau mot de passe temporaire en clair
 */
export async function sendPasswordResetEmail(
  to: string,
  displayName: string,
  tempPassword: string,
): Promise<void> {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Vindhellfest" <${getEnv("SMTP_USER")}>`,
    to,
    subject: "Reinitialisation de votre mot de passe",
    text: `Bonjour ${displayName},\n\nVous avez demande la reinitialisation de votre mot de passe.\nVotre nouveau mot de passe provisoire : ${tempPassword}\n\nVeuillez le modifier des votre prochaine connexion.`,
  });
}

/** Transmet le message du formulaire de contact a l'adresse de l'organisation.
 * @param {string} from adresse email de l'expediteur (visiteur)
 * @param {string} name nom complet de l'expediteur
 * @param {string} subject sujet du message
 * @param {string} message contenu du message
 */
export async function sendContactEmail(
  from: string,
  name: string,
  subject: string,
  message: string,
): Promise<void> {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Vindhellfest" <${getEnv("SMTP_USER")}>`,
    to: getEnv("CONTACT_EMAIL"),
    replyTo: from,
    subject: `[Contact] ${subject}`,
    text: `Message de : ${name} <${from}>\n\n${message}`,
  });
}

/** Envoie les identifiants provisoires au nouvel utilisateur cree par un admin.
 * @param {string} to adresse email du destinataire
 * @param {string} displayName nom complet de l'utilisateur
 * @param {string} tempPassword mot de passe provisoire en clair genere a la creation
 */
export async function sendWelcomeEmail(
  to: string,
  displayName: string,
  tempPassword: string,
): Promise<void> {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Vindhellfest" <${getEnv("SMTP_USER")}>`,
    to,
    subject: "Votre compte Vindhellfest",
    text: `Bonjour ${displayName},\n\nVotre compte a ete cree.\nIdentifiant : ${to}\nMot de passe provisoire : ${tempPassword}\n\nVeuillez le modifier des votre premiere connexion.`,
  });
}
