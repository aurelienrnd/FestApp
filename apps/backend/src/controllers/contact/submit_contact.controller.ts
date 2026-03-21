import type { Request, Response } from "express";
import { sendContactEmail } from "../../services/mailer";

/** Transmet le message du formulaire de contact par email a l'organisation.
 * Recupere les champs valides par le schema Zod puis appelle sendContactEmail.
 */
export async function submitContact(req: Request, res: Response) {
  const { email, name, subject, message } = req.body as {
    email: string;
    name: string;
    subject: string;
    message: string;
  };

  await sendContactEmail(email, name, subject, message);

  return res.status(200).json({ message: "Message envoye" });
}
