"use client";

import { useState } from "react";
import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import {
  type ApiMessageResponse,
  apiRequest,
} from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";

type UserToDelete = {
  id: string;
  display_name: string | null;
};

type DelateUserModalProps = {
  isOpen: boolean;
  selectedUser: UserToDelete | null;
  onClose: () => void;
  handleUser: (userId: string) => void;
};

/** Affiche la modale de confirmation pour supprimer un utilisateur.
 * Ouvre une confirmation, lance la requete DELETE et affiche l'etat succes/erreur.
 * @param {DelateUserModalProps} props Proprietes de controle de la modale.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {UserToDelete | null} props.selectedUser Utilisateur selectionne pour la suppression.
 * @param {() => void} props.onClose Ferme la modale.
 * @param {(userId: string) => void} props.handleUser Met a jour la liste des users et ferme la modale.
 * @children ModalCloseButton Ferme la modale.
 */
export default function DelateUserModal({
  isOpen,
  selectedUser,
  onClose,
  handleUser,
}: DelateUserModalProps) {
  // Etats locaux de soumission, d'erreur et de confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);


  // Reinitialise l'etat interne et ferme la modale
  const handleClose = () => {
    setIsSubmitting(false);
    setSubmitError(null);
    setIsDeleted(false);
    onClose();
  };

  // Confirme la suppression et met a jour l'UI selon la reponse API
  const handleConfirmDelete = async () => {
    if (!selectedUser) {
      return;
    }

    // Active l’état de soumission et réinitialise le message d’erreur
    setIsSubmitting(true);
    setSubmitError(null);

    // Envoie une requête DELETE à l’API pour supprimer l’utilisateur sélectionné
    const result = await apiRequest<ApiMessageResponse>(
      `/admin/users/${selectedUser.id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );

    // Gère l’erreur retournée par l’API et arrête le processus
    if (result.error) {
      setSubmitError(getApiErrorMessage(result.error));
      setIsSubmitting(false);
      return;
    }

    // Notifie la suppression de l’utilisateur, met à jour l’état local et désactive la soumission
    handleUser(selectedUser.id);
    setIsDeleted(true);
    setIsSubmitting(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Suppression utilisateur"
      className="modal"
      overlayClassName="modal-overlay"
    >
      <ModalCloseButton onClose={handleClose} />
      <h2 className="title-modal">Suppression utilisateur</h2>

      <div className="m-(--space-md)">
        {isDeleted ? (
          <div className="form-modal">
            <p className="text-center">L&apos;utilisateur a ete supprime.</p>
            <div className="submit-modal-area">
              <button type="button" className="btn-cta" onClick={handleClose}>
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <div className="form-modal">
            <p className="text-center">
              Voulez-vous confirmer la suppression de{" "}
              <strong>{selectedUser?.display_name ?? "cet utilisateur"}</strong>{" "}
              ?
            </p>

            <div className="submit-modal-area">
              <button
                type="button"
                className="btn-cta"
                onClick={handleConfirmDelete}
                disabled={isSubmitting || !selectedUser}
              >
                {isSubmitting ? "Suppression..." : "Confirmer"}
              </button>
            </div>
            {submitError ? (
              <p className="text-center text-(--color-1)">{submitError}</p>
            ) : null}
          </div>
        )}
      </div>
    </Modal>
  );
}
