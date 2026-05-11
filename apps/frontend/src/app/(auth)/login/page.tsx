"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import ForgotPassword from "../../../components/ForgotPassword";
import type { ApiMessageResponse } from "../../../type";
import { useMutation } from "../../../hooks/useMutation";
import { isEmpty } from "../../../functions/validation";

/** Affiche la page de connexion admin avec un formulaire email/mot de passe.
 * Envoie la requete de connexion via `useMutation` avec les credentials inclus.
 * Affiche le message d'erreur API au-dessus du bouton en cas d'echec.
 * Redirige vers `/admin/dashboard` si la connexion reussit.
 * Ouvre une modale "Mot de passe oublie" au clic sur le bouton dedie.
 * @function useMutation Envoie la requete POST de connexion et gere les etats loading/error
 * @children ForgotPassword Affiche le formulaire d'initialisation de reinitialisation du mot de passe.
 */
export default function Page() {
  // Permet de rediriger vers une autre page
  const router = useRouter();

  // Initialise les champs du formulaire, le message d'erreur et l'etat d'ouverture de la modale
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate, isLoading, error } = useMutation<ApiMessageResponse>("/admin/auth/login", "POST");
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);

  // Valide le contenu du formulaire.
  const isFormInvalid = isEmpty(email) || isEmpty(password);

  // Gere l'envoi du login et affiche l'erreur si echec
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isFormInvalid) return;
    mutate({ email: email.trim(), password }, () => {
      router.push("/admin/dashboard");
    });
  };

  return (
    <section className="section-page flex flex-col items-center justify-center">
      <h1 className="title1">Connexion</h1>

      <form
        className="w-full max-w-lg space-y-(--ctx-form-gap)"
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
            <p className="error-message">{error}</p>
          ) : null}

          <button type="submit" className="btn-cta" disabled={isFormInvalid || isLoading}>
            Envoyer
          </button>
        </div>
      </form>

      <button
        type="button"
        className="mt-(--ctx-form-gap) btn-type-2"
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
