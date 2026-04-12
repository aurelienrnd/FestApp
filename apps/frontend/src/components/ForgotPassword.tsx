import { useState, type FormEvent } from "react";
import { apiRequest, type ApiMessageResponse } from "../functions/apiRequest";
import { getApiErrorMessage } from "../functions/getApiErrorMessage";

/** Affiche le formulaire "Mot de passe oublié".
 * Permet à l'utilisateur de saisir son email pour demander la réinitialisation du mot de passe.
 * Bloque l'envoi si le champ email est vide (après suppression des espaces).
 * @returns {JSX.Element} Le contenu du formulaire de récupération de mot de passe.
 */
export default function ForgotPassword() {
  // Champ du formulaire
  const [email, setEmail] = useState("");

  // Etats de gestion de la soumission
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // verifie que le champ email n'est pas vide (après suppression des espaces) pour activer le bouton d'envoi
  const isFormInvalid = email.trim() === "";

  // envoie une requete à l'API pour demander la réinitialisation du mot de passe, en fournissant l'email saisi par l'utilisateur
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isFormInvalid) {
      return;
    }

    setIsLoading(true);

    const result = await apiRequest<ApiMessageResponse>(
      "/admin/auth/forgot-password",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      },
    );

    if (result.error) {
      setError(getApiErrorMessage(result.error));
      setIsLoading(false);
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="m-6">
      {success ? (
        <p className="mt-(--ctx-paragraph-gap) text-center">
          Un nouveau mot de passe vous a ete envoye par email.
        </p>
      ) : (
        <>
          <p className="mt-(--ctx-paragraph-gap) text-center">
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
              <button
                type="submit"
                className="btn-cta"
                disabled={isFormInvalid || isLoading}
              >
                Envoyer
              </button>
            </div>

            {error ? (
              <p className="text-center text-(--color-1)">{error}</p>
            ) : null}
          </form>
        </>
      )}
    </div>
  );
}
