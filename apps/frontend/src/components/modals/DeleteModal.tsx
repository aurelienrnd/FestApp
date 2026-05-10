"use client";

import Modal from "react-modal";
import ModalCloseButton from "../ModalCloseButton";
import { useDelete } from "../../hooks/useDelete";

type DeleteModalProps<T extends { id: string }> = {
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (id: string) => void;
  item: T | null;
  endpoint: string;
  entityName: string;
  getLabel: (item: T) => string;
};

/** Modale de confirmation de suppression generique.
 * @param {T | null} props.item Element a supprimer.
 * @param {string} props.endpoint Chemin de base de l'endpoint DELETE (ex : "/admin/artists").
 * @param {string} props.entityName Nom de l'entite pour les textes (ex : "artiste").
 * @param {(item: T) => string} props.getLabel Extrait le nom affiche dans la confirmation.
 * @param {(id: string) => void} props.onDeleted Appele avec l'id apres suppression reussie.
 * @children ModalCloseButton Ferme la modale.
 */
export default function DeleteModal<T extends { id: string }>({
  isOpen,
  onClose,
  onDeleted,
  item,
  endpoint,
  entityName,
  getLabel,
}: DeleteModalProps<T>) {
  const {
    handleDelete,
    isSubmitting,
    isDeleted,
    error: submitError,
    reset,
  } = useDelete(endpoint);

  // Reinitialise l'etat interne et ferme la modale
  const handleClose = () => {
    reset();
    onClose();
  };

  // Confirme la suppression et met a jour l'UI selon la reponse API
  const handleConfirmDelete = () => {
    if (!item) return;
    handleDelete(item.id, onDeleted);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel={`Suppression ${entityName}`}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <ModalCloseButton onClose={handleClose} />
      <h2 className="title-modal">Suppression {entityName}</h2>

      <div className="m-6">
        {isDeleted ? (
          <div className="form-modal">
            <p className="text-center">L&apos;{entityName} a ete supprime.</p>
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
              <strong>{item ? getLabel(item) : `cet ${entityName}`}</strong> ?
            </p>

            <div className="submit-modal-area">
              <button
                type="button"
                className="btn-cta"
                onClick={handleConfirmDelete}
                disabled={isSubmitting || !item}
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
