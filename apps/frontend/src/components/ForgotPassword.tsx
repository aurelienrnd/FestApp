"use client";

import { useState, type FormEvent } from "react";
import type { ApiMessageResponse } from "../type";
import { useMutation } from "../hooks/useMutation";
import { isEmpty } from "../functions/validation";

/** Affiche le formulaire "Mot de passe oublié".
 * Permet à l'utilisateur de saisir son email pour demander la réinitialisation du mot de passe.
 * Bloque l'envoi si le champ email est vide (après suppression des espaces).
 * @returns {JSX.Element} Le contenu du formulaire de récupération de mot de passe.
 */
export default function ForgotPassword() {
  // Champ du formulaire et état de succès de la requête
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  // verifie que le champ email n'est pas vide et initialise la requête
  const isFormInvalid = isEmpty(email);
  const { mutate, isLoading, error } = useMutation<ApiMessageResponse>(
    "/admin/auth/forgot-password",
    "POST",
  );

  // Gère la soumission du formulaire
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isFormInvalid) return;
    mutate({ email: email.trim() }, () => setSuccess(true));
  };

  return (
    <div className="m-6">
      {success ? (
        <p className="success-message mt-(--ctx-paragraph-gap)">
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

            {error ? <p className="error-message">{error}</p> : null}
          </form>
        </>
      )}
    </div>
  );
}
