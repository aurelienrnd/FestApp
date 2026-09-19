"use client";

import { useState } from "react";
import Modal from "react-modal";
import ModalCloseButton from "../ModalCloseButton";
import { useDelete } from "../../hooks/useDelete";

type DeleteModalProps<T extends { id: string }> = {
  isOpen: boolean;
  onClose: () => void;
  onDeleted: (id: string) => void;
  item: T | null;
  entityName: string;
  getLabel: (item: T) => string;
  endpoint?: string; // Chemin de base de l'endpoint DELETE (ex : "/admin/artists").
  onConfirm?: (id: string) => Promise<{ error?: { message?: string | null } | null }>; // Suppression alternative (ex : Better Auth), a la place de endpoint.
};

/** Modale de confirmation de suppression generique.
 * @param {T | null} props.item Element a supprimer.
 * @param {string} [props.endpoint] Chemin de base de l'endpoint DELETE (ex : "/admin/artists").
 * @param {(id: string) => Promise} [props.onConfirm] Suppression alternative (ex : Better Auth), a la place de endpoint.
 * @param {string} props.entityName Nom de l'entite pour les textes (ex : "artiste").
 * @param {(item: T) => string} props.getLabel Extrait le nom affiche dans la confirmation.
 * @param {(id: string) => void} props.onDeleted Appele avec l'id apres suppression reussie.
 * @param {boolean} props.isOpen Controle l'affichage de la modale.
 * @param {() => void} props.onClose Ferme la modale.
 * @function useDelete Custom hook pour gerer la suppression via l'API REST generique (utilise sauf si onConfirm est fourni).
 * @children ModalCloseButton Ferme la modale.
 */
export default function DeleteModal<T extends { id: string }>({
  isOpen,
  onClose,
  onDeleted,
  item,
  endpoint,
  onConfirm,
  entityName,
  getLabel,
}: DeleteModalProps<T>) {
  // Suppression via l'API REST generique (artists, news) — toujours appele (regles des hooks),
  // ignore quand onConfirm est fourni (cas users, delegue a Better Auth).
  const {
    handleDelete,
    isSubmitting: isSubmittingEndpoint,
    isDeleted: isDeletedEndpoint,
    error: endpointError,
    reset: resetEndpoint,
  } = useDelete(endpoint ?? "");

  // Suppression via une fonction custom (ex : authClient.admin.removeUser)
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const [isDeletedCustom, setIsDeletedCustom] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  // Determine quel chemin de suppression est utilise (endpoint ou onConfirm)
  const isSubmitting = onConfirm ? isSubmittingCustom : isSubmittingEndpoint;
  const isDeleted = onConfirm ? isDeletedCustom : isDeletedEndpoint;
  const submitError = onConfirm ? customError : endpointError;

  // Ferme la modale et reinitialise l'etat des deux chemins de suppression
  const handleClose = () => {
    resetEndpoint();
    setIsSubmittingCustom(false);
    setIsDeletedCustom(false);
    setCustomError(null);
    onClose();
  };

  // Gere la soumission du formulaire de suppression
  const handleConfirmDelete = async () => {
    // Si aucun item n'est fourni, on ne fait rien
    if (!item) return;

    // Si une fonction de suppression custom est fournie, on l'utilise
    if (onConfirm) {
      setIsSubmittingCustom(true);
      setCustomError(null);

      const result = await onConfirm(item.id);

      setIsSubmittingCustom(false);

      // Si la suppression custom a echoue, on affiche l'erreur
      if (result.error) {
        setCustomError(result.error.message ?? "Une erreur est survenue.");
        return;
      }

      // Si la suppression custom a reussi, on met a jour l'etat et on appelle onDeleted
      setIsDeletedCustom(true);
      onDeleted(item.id);
      return;
    }

    // Sinon, on utilise le hook useDelete pour supprimer via l'endpoint
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
            <p className="success-message">L&apos;{entityName} a ete supprime.</p>
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
