"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "../lib/auth-client";
import { isEmail } from "../functions/validation";

/** Affiche le formulaire "Mot de passe oublié".
 * Permet à l'utilisateur de saisir son email pour demander un lien de réinitialisation.
 * Bloque l'envoi si le champ email n'est pas au format email.
 * Le message de succès est volontairement neutre (ne confirme pas l'existence du compte) :
 * Better Auth repond toujours 200, que l'email soit connu ou non.
 * @function isEmail pour valider le format de l'email
 * @function authClient.requestPasswordReset Appel Better Auth pour envoyer le lien de reinitialisation
 * @returns {JSX.Element} Le contenu du formulaire de récupération de mot de passe.
 */
export default function ForgotPassword() {
  // Champ du formulaire et état de succès de la requête
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  // Etat de l'appel Better Auth (authClient.requestPasswordReset -> /api/auth/request-password-reset)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // verifie que le champ email est valide
  const isFormInvalid = !isEmail(email);

  // Gère la soumission du formulaire
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isFormInvalid) return;

    setIsLoading(true);
    setError(null);

    // Delegue a Better Auth : genere un token et envoie le lien de reinitialisation vers la page /reset-password du front. Le token est verifie puis consomme cote serveur au moment de la reinitialisation.
    const result = await authClient.requestPasswordReset({
      email: email.trim(),
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (result.error) {
      setError(result.error.message ?? "Une erreur est survenue.");
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="m-6">
      {success ? (
        <p className="success-message mt-(--ctx-paragraph-gap)">
          Si un compte existe pour cet email, un lien de reinitialisation
          vient de lui etre envoye.
        </p>
      ) : (
        <>
          <p className="mt-(--ctx-paragraph-gap) text-center">
            Nous vous enverrons un lien pour reinitialiser votre mot de passe
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
              <button
                type="submit"
                className="btn-cta"
                disabled={isFormInvalid || isLoading}
              >
                Envoyer
              </button>
            </div>

            {error ? <p className="error-message">{error}</p> : null}
          </form>
        </>
      )}
    </div>
  );
}
