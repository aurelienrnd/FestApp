"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "../../../lib/auth-client";
import { isEmpty } from "../../../functions/validation";

/** Affiche le formulaire de choix du nouveau mot de passe.
 * Le token est lu dans l'URL (?token=...), depose par Better Auth apres verification
 * La page reste publique mais n'est pas "protegee" par elle-meme : c'est le token, verifie
 * et consomme une seule fois cote serveur (Better Auth, expire au bout d'1h), qui empeche
 * toute modification du mot de passe sans lien valide.
 * @function authClient.resetPassword Appel Better Auth pour poser le nouveau mot de passe
 * @function isEmpty Fonction de validation pour verifier si un champ est vide
 */
function ResetPasswordForm() {
  // Lecture du token, de l'eventuelle erreur et du contexte (invite ou reinitialisation) dans l'URL
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const linkError = searchParams.get("error");
  const isInvite = searchParams.get("context") === "invite";

  // Champs du formulaire
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // pour stocker les erreurs de validation locale (repetition des mots de passe)
  const [localError, setLocalError] = useState<string | null>(null);

  // Etat de l'appel Better Auth (authClient.resetPassword -> /api/auth/reset-password)
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // on ajoute les erreurs de validation locale et d'API dans une seule variable pour l'affichage
  const error = localError ?? apiError;

  // si le token est absent ou si l'URL contient une erreur, on affiche un message d'erreur
  if (!token || linkError) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="title1">
          {isInvite ? "Invitation invalide" : "Lien invalide"}
        </h1>
        <p className="error-message">
          {isInvite
            ? "Ce lien d'invitation est invalide ou a expire. Demandez a un administrateur de vous en renvoyer un."
            : "Ce lien de reinitialisation est invalide ou a expire."}
        </p>
        <Link href="/login" className="btn-type-2">
          Retour a la connexion
        </Link>
      </div>
    );
  }

  // si la reinitialisation a reussi, on affiche un message de succes et un bouton pour se connecter
  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="title1">
          {isInvite ? "Compte active" : "Mot de passe modifie"}
        </h1>
        <p className="success-message">
          {isInvite
            ? "Votre mot de passe a ete defini, votre compte est pret."
            : "Votre mot de passe a ete modifie avec succes."}
        </p>
        <button
          type="button"
          className="btn-cta"
          onClick={() => router.push("/login")}
        >
          Se connecter
        </button>
      </div>
    );
  }

  // Verifie si le formulaire de reinitialisation est incomplet
  const isFormInvalid =
    newPassword.trim().length < 8 || isEmpty(confirmPassword);

  // Gere la soumission du formulaire de reinitialisation
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isFormInvalid) return;

    // Verifie que les deux mots de passe sont identiques
    if (newPassword !== confirmPassword) {
      setLocalError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLocalError(null);

    setIsLoading(true);
    setApiError(null);

    // Delegue a Better Auth : consomme le token (usage unique) et cree/met a jour le hash.
    const result = await authClient.resetPassword({ newPassword, token });

    setIsLoading(false);

    if (result.error) {
      setApiError(result.error.message ?? "Une erreur est survenue.");
      return;
    }

    setSuccess(true);
  };

  return (
    <>
      <h1 className="title1">
        {isInvite ? "Bienvenue" : "Reinitialisation du mot de passe"}
      </h1>

      {isInvite ? (
        <p className="mt-(--ctx-paragraph-gap) text-center">
          Un compte a ete cree pour vous. Choisissez votre mot de passe pour
          l&apos;activer.
        </p>
      ) : null}

      <form
        className="w-full max-w-lg space-y-(--ctx-form-gap)"
        onSubmit={handleSubmit}
      >
        <div>
          <label htmlFor="newPassword" className="sr-only">
            Nouveau mot de passe
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Nouveau mot de passe"
            className="input"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="sr-only">
            Confirmer le nouveau mot de passe
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Confirmer le nouveau mot de passe"
            className="input"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        <div className="flex flex-col items-center gap-2 pt-2">
          {error ? <p className="error-message">{error}</p> : null}

          <button
            type="submit"
            className="btn-cta"
            disabled={isFormInvalid || isLoading}
          >
            {isInvite ? "Creer mon mot de passe" : "Reinitialiser"}
          </button>
        </div>
      </form>
    </>
  );
}

/** Affiche la page de reinitialisation/creation de mot de passe, atteinte depuis le lien
 * recu par email (mot de passe oublie ou invitation d'un nouvel utilisateur).
 * Le titre depend de ?context=invite, lu dans ResetPasswordForm : useSearchParams impose de
 * toute facon un Suspense boundary en app router (bailout sur le rendu statique), donc le
 * @children ResetPasswordForm
 */
export default function Page() {
  return (
    <section className="section-page flex flex-col items-center justify-center">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </section>
  );
}
