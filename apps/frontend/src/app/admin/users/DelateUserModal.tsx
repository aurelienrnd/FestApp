"use client";

import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import { useDelete } from "../../../hooks/useDelete";
import type { UserItem } from "../../../type";

type DelateUserModalProps = {
  isOpen: boolean;
  selectedUser: Pick<UserItem, "id" | "display_name"> | null;
  onClose: () => void;
  handleUser: (userId: string) => void;
};

/** Affiche la modale de confirmation pour supprimer un utilisateur.
 * Ouvre une confirmation, lance la requete DELETE et affiche l'etat succes/erreur.
 * @param {DelateUserModalProps} props Proprietes de controle de la modale.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {Pick<UserItem, "id" | "display_name"> | null} props.selectedUser Utilisateur selectionne pour la suppression.
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
  const { handleDelete, isSubmitting, isDeleted, error: submitError } = useDelete("/admin/users");

  // Reinitialise l’etat interne et ferme la modale
  const handleClose = () => onClose();

  // Confirme la suppression et met a jour l’UI selon la reponse API
  const handleConfirmDelete = () => {
    if (!selectedUser) return;
    handleDelete(selectedUser.id, handleUser);
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

      <div className="m-6">
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
              <p className="error-message">{submitError}</p>
            ) : null}
          </div>
        )}
      </div>
    </Modal>
  );
}
