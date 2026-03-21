"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import ForgotPassword from "../../../components/ForgotPassword";
import {
  apiRequest,
  type ApiMessageResponse,
} from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";

/** Affiche la page de connexion admin avec un formulaire email/mot de passe.
 * Envoie la requete de connexion via `apiRequest` avec les credentials inclus.
 * Affiche le message d'erreur API au-dessus du bouton en cas d'echec.
 * Redirige vers `/admin/dashboard` si la connexion reussit.
 * Ouvre une modale "Mot de passe oublie" au clic sur le bouton dedie.
 * @function apiRequest Envoie une requete HTTP a l'API avec `fetch`
 * @function getApiErrorMessage Definit un message a retourner a l'utilisateur selon le statut de l'erreur
 * @children ForgotPassword Affiche le formulaire d'initialisation de reinitialisation du mot de passe.
 */
export default function Page() {
  // Permet de rediriger vers une autre page
  const router = useRouter();

  // Initialise les champs du formulaire, le message d'erreur et l'etat d'ouverture de la modale
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);

  // Valide le contenu du formulaire.
  const isFormInvalid = email.trim() === "" || password.trim() === "";

  // Gere l'envoi du login et affiche l'erreur si echec
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // Empeche le rechargement de page, reset l'erreur, puis stoppe si formulaire invalide.
    event.preventDefault();
    setError(null);
    if (isFormInvalid) {
      return;
    }

    setIsLoading(true);

    // Envoie la requete de connexion avec email/mot de passe au format JSON.
    const result = await apiRequest<ApiMessageResponse>("/admin/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });

    // Si l'API renvoie une erreur, on l'affiche, sinon on redirige l'utilisateur vers le dashboard.
    if (result.error) {
      setError(getApiErrorMessage(result.error));
      setIsLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  };

  return (
    <section className="section-page flex flex-col items-center justify-center">
      <h1 className="title1">Connexion</h1>

      <form
        className="w-full max-w-lg space-y-(--spacing-form)"
        onSubmit={handleSubmit}
      >
        <div>
          <label htmlFor="loginEmail" className="sr-only">
            Votre email
          </label>
          <input
            id="loginEmail"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Votre email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="loginPassword" className="sr-only">
            Votre mot de passe
          </label>
          <input
            id="loginPassword"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Votre mot de passe"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="flex flex-col items-center gap-2 pt-2">
          {error ? (
            <p className="text-center text-(--color-1)">{error}</p>
          ) : null}

          <button type="submit" className="btn-cta" disabled={isFormInvalid || isLoading}>
            Envoyer
          </button>
        </div>
      </form>

      <button
        type="button"
        className="mt-(--spacing-form) btn-type-2"
        onClick={() => setIsForgotPasswordModalOpen(true)}
      >
        Mot de passe oublie
      </button>

      <Modal
        isOpen={isForgotPasswordModalOpen}
        onRequestClose={() => setIsForgotPasswordModalOpen(false)}
        contentLabel="Mot de passe oublie"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <ModalCloseButton onClose={() => setIsForgotPasswordModalOpen(false)} />
        <h2 className="title-modal">Mot de passe oublie</h2>

        <ForgotPassword />
      </Modal>
    </section>
  );
}
