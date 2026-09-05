"use client";

import { useState, type FormEvent } from "react";
import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import type { ApiMessageResponse } from "../../../type";
import { useMutation } from "../../../hooks/useMutation";
import { isEmpty } from "../../../functions/validation";

type ChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/** Affiche la modale de changement de mot de passe.
 * Gere les trois champs du formulaire, la validation locale, la soumission API et les retours visuels.
 * @param {ChangePasswordModalProps} props Proprietes de controle de la modale
 * @param {boolean} props.isOpen Definit si la modale est ouverte
 * @param {() => void} props.onClose Ferme la modale
 * @function useMutation Hook de mutation pour l'appel API de changement de mot de passe
 * @function isEmpty Fonction de validation pour verifier si un champ est vide
 * @children ModalCloseButton Ferme la modale
 */
export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  // Champs du formulaire
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // pour stocker les erreurs de validation locale repetion des mots de passe
  const [localError, setLocalError] = useState<string | null>(null);

  // Initialisation de la requete
  const {
    mutate,
    isLoading,
    error: apiError,
    reset,
  } = useMutation<ApiMessageResponse>("/admin/auth/password", "PATCH");

  // on ajoute les erreurs de validation locale et d'API dans une seule variable pour l'affichage
  const error = localError ?? apiError;
  const [success, setSuccess] = useState(false);

  // Verifie si le formulaire de changement de mot de passe est incomplet
  const isFormInvalid =
    oldPassword.trim().length < 8 ||
    newPassword.trim().length < 8 ||
    isEmpty(confirmPassword);

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

    //Fait un appel API pour changer le mot de passe
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
      onRequestClose={handleClose}
      contentLabel="Modifier le mot de passe"
      className="modal"
      overlayClassName="modal-overlay"
    >
      <ModalCloseButton onClose={handleClose} />
      <h2 className="title-modal">Mot de passe</h2>

      <div className="m-6">
        {success ? (
          <div className="flex flex-col items-center gap-3">
            <p className="success-message">
              Votre mot de passe a ete modifie avec succes.
            </p>
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

            {error ? <p className="error-message">{error}</p> : null}
          </form>
        )}
      </div>
    </Modal>
  );
}
