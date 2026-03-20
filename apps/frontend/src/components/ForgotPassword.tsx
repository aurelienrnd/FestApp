import { useState, type FormEvent } from "react";

/** Affiche le formulaire "Mot de passe oublié".
 * Permet à l'utilisateur de saisir son email pour demander la réinitialisation du mot de passe.
 * Bloque l'envoi si le champ email est vide (après suppression des espaces).
 * @returns {JSX.Element} Le contenu du formulaire de récupération de mot de passe.
 */
export default function ForgotPassword() {
  // Champ du formulaire
  const [email, setEmail] = useState("");

  // Etats de gestion de la soumission
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const isFormInvalid = email.trim() === "";

  // Intercepte la soumission du formulaire et annule l'envoi si l'email est invalide.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    if (isFormInvalid) {
      return;
    }

    setIsSubmitting(true);

    // TODO requet
    setIsSubmitting(false);
    setSuccess(true);
  };

  return (
    <div className="m-(--space-md)">
      {success ? (
        <p className="mt-(--spacing-paragraph) text-center">
          Un nouveau mot de passe vous a ete envoye par email.
        </p>
      ) : (
        <>
          <p className="mt-(--spacing-paragraph) text-center">
            Nous vous enverrons un nouveau mot de passe sur votre boite mail
          </p>

          <form className="form-modal" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="forgotPasswordEmail" className="sr-only">
                Votre email
              </label>
              <input
                id="forgotPasswordEmail"
                name="forgotPasswordEmail"
                type="email"
                autoComplete="email"
                placeholder="Votre email"
                className="input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="submit-modal-area">
              <button type="submit" className="btn-cta" disabled={isFormInvalid || isSubmitting}>
                Envoyer
              </button>
            </div>

            {submitError ? (
              <p className="text-center text-(--color-1)">{submitError}</p>
            ) : null}
          </form>
        </>
      )}
    </div>
  );
}
