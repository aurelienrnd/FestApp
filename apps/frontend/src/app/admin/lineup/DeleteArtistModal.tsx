"use client";

import { useState } from "react";
import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import {
  type ApiMessageResponse,
  apiRequest,
} from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";
import type { ArtistListRow } from "../../../type";

type DeleteArtistModalProps = {
  isOpen: boolean;
  selectedArtist: Pick<ArtistListRow, "id" | "name"> | null;
  onClose: () => void;
  handleArtist: (artistId: string) => void;
};

/** Affiche la modale de confirmation pour supprimer un artiste.
 * Ouvre une confirmation, lance la requete DELETE et affiche l'etat succes/erreur.
 * @param {DeleteArtistModalProps} props Proprietes de controle de la modale.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {Pick<ArtistListRow, "id" | "name"> | null} props.selectedArtist Artiste selectionne pour la suppression.
 * @param {() => void} props.onClose Ferme la modale.
 * @param {(artistId: string) => void} props.handleArtist Met a jour la liste des artistes et ferme la modale.
 * @children ModalCloseButton Ferme la modale.
 */
export default function DeleteArtistModal({
  isOpen,
  selectedArtist,
  onClose,
  handleArtist,
}: DeleteArtistModalProps) {
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
    if (!selectedArtist) {
      return;
    }

    // Active l'etat de soumission et reinitialise le message d'erreur
    setIsSubmitting(true);
    setSubmitError(null);

    // Envoie une requete DELETE a l'API pour supprimer l'artiste selectionne
    const result = await apiRequest<ApiMessageResponse>(
      `/admin/artists/${selectedArtist.id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );

    // Gere l'erreur retournee par l'API et arrete le processus
    if (result.error) {
      setSubmitError(getApiErrorMessage(result.error));
      setIsSubmitting(false);
      return;
    }

    // Notifie la suppression de l'artiste, met a jour l'etat local et desactive la soumission
    handleArtist(selectedArtist.id);
    setIsDeleted(true);
    setIsSubmitting(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Suppression artiste"
      className="modal"
      overlayClassName="modal-overlay"
    >
      <ModalCloseButton onClose={handleClose} />
      <h2 className="title-modal">Suppression artiste</h2>

      <div className="m-6">
        {isDeleted ? (
          <div className="form-modal">
            <p className="text-center">L&apos;artiste a ete supprime.</p>
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
              <strong>{selectedArtist?.name ?? "cet artiste"}</strong> ?
            </p>

            <div className="submit-modal-area">
              <button
                type="button"
                className="btn-cta"
                onClick={handleConfirmDelete}
                disabled={isSubmitting || !selectedArtist}
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