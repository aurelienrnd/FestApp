"use client";

import { useState, type FormEvent } from "react";
import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import type { ApiMessageResponse } from "../../../type";
import { useMutation } from "../../../hooks/useMutation";

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

  const { mutate, isLoading, error: apiError, reset } = useMutation<ApiMessageResponse>("/admin/auth/password", "PATCH");
  // Erreur de validation locale (confirmation de mot de passe) — distincte de l'erreur API
  const [localError, setLocalError] = useState<string | null>(null);
  const error = localError ?? apiError;
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
      setLocalError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setLocalError(null);
    mutate({ password: oldPassword, newPassword }, () => setSuccess(true));
  };

  // Gere la fermeture de la modal et reinitialise les etats associes
  const handleClose = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setLocalError(null);
    reset();
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

      <div className="m-6">
        {success ? (
          <div className="flex flex-col items-center gap-3">
            <p className="error-message">
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
              <p className="error-message">{error}</p>
            ) : null}
          </form>
        )}
      </div>
    </Modal>
  );
}
