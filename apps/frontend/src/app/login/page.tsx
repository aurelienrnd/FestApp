"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import Modal from "react-modal";
import ModalCloseButton from "../../components/ModalCloseButton";
import ForgotPassword from "../../components/ForgotPassword";
import { apiRequest } from "../../functions/apiRequest";

type ApiError = { message?: string; status?: number };

/** Affiche la page de connexion admin avec un formulaire email/mot de passe.
 * Envoie la requete de connexion via `apiRequest` avec les credentials inclus.
 * Affiche le message d'erreur API au-dessus du bouton en cas d'echec.
 * Redirige vers `/admin/dashboard` si la connexion reussit.
 * Ouvre une modale "Mot de passe oublie" au clic sur le bouton dedie.
 * @children ForgotPassword Affiche le formulaire d'initialisation de reinitialisation du mot de passe.
 */
export default function Page() {
  // Permet de rediriger vers une autre page
  const router = useRouter();

  // Initialise les champs du formulaire, le message d'erreur et l'etat d'ouverture de la modale
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);

  // Definit la racine pour l'accessibilite de react-modal.
  useEffect(() => {
    Modal.setAppElement("#app-root");
  }, []);

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

    // Envoie la requete de connexion avec email/mot de passe au format JSON.
    const result = await apiRequest("/admin/auth/login", {
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
      setError(result.error);
      return;
    }
    router.push("/admin/dashboard");
  };

  return (
    <section className="section-page flex flex-col items-center justify-center">
      <h1 className="text-center text-6xl font-black uppercase md:text-8xl">
        Connexion
      </h1>

      <form className="mt-12 w-full max-w-lg space-y-8" onSubmit={handleSubmit}>
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
            <p className="mb-3 text-sm text-(--collor-1)">{error.message}</p>
          ) : null}
          <button type="submit" className="btn-cta" disabled={isFormInvalid}>
            Envoyer
          </button>
        </div>
      </form>

      <button
        type="button"
        className="mt-10 btn-type-2"
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
