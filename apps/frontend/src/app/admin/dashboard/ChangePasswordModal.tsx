"use client";

import { useState, type FormEvent } from "react";
import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import {
  apiRequest,
  type ApiMessageResponse,
} from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";

type ChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  forced?: boolean;
};

/** Affiche la modale de changement de mot de passe.
 * Gere les trois champs du formulaire, la validation locale, la soumission API et les retours visuels.
 * En mode forced, le bouton de fermeture est masque et la modale ne peut pas etre fermee avant succes.
 * @param {ChangePasswordModalProps} props Proprietes de controle de la modale
 * @param {boolean} props.isOpen Definit si la modale est ouverte
 * @param {() => void} props.onClose Ferme la modale
 * @param {boolean} [props.forced] Si vrai, force le changement de mot de passe sans possibilite de fermer
 * @children ModalCloseButton Ferme la modale
 */
export default function ChangePasswordModal({
  isOpen,
  onClose,
  forced = false,
}: ChangePasswordModalProps) {
  // Champs du formulaire
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // etats de gestion de la soumission
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Valeur de succes de la modification du mot de passe, affiche un message de succes et masque le formulaire
  const [success, setSuccess] = useState(false);


  // Verifie si le formulaire de changement de mot de passe est incomplet
  const isFormInvalid =
    oldPassword.trim() === "" ||
    newPassword.trim() === "" ||
    confirmPassword.trim() === "";

  // Gere la soumission du formulaire de changement de mot de passe
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isFormInvalid) return;

    // Verifie que les deux nouveaux mots de passe sont identiques
    if (newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await apiRequest<ApiMessageResponse>("/admin/auth/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: oldPassword, newPassword }),
    });

    if (result.error) {
      setError(getApiErrorMessage(result.error));
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  // Gere la fermeture de la modal et reinitialise les etats associes
  const handleClose = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setIsLoading(false);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={forced ? undefined : handleClose}
      contentLabel="Modifier le mot de passe"
      className="modal"
      overlayClassName="modal-overlay"
    >
      {!forced && <ModalCloseButton onClose={handleClose} />}
      <h2 className="title-modal">Mot de passe</h2>

      <div className="m-(--space-md)">
        {success ? (
          <div className="flex flex-col items-center gap-(--space-sm)">
            <p className="text-center text-(--color-1)">
              Votre mot de passe a ete modifie avec succes.
            </p>
            {forced && (
              <button type="button" className="btn-cta" onClick={handleClose}>
                Continuer
              </button>
            )}
          </div>
        ) : (
          <form className="form-modal" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="oldPassword" className="sr-only">
                Ancien mot de passe
              </label>
              <input
                id="oldPassword"
                name="oldPassword"
                type="password"
                autoComplete="current-password"
                placeholder="Ancien mot de passe"
                className="input"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
              />
            </div>

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

            <div className="submit-modal-area">
              <button
                type="submit"
                className="btn-cta"
                disabled={isFormInvalid || isLoading}
              >
                Modifier
              </button>
            </div>

            {error ? (
              <p className="text-center text-(--color-1)">{error}</p>
            ) : null}
          </form>
        )}
      </div>
    </Modal>
  );
}
