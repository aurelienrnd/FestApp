"use client";

import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import { useDelete } from "../../../hooks/useDelete";
import type { ArtistItem } from "../../../type";

type DeleteArtistModalProps = {
  isOpen: boolean;
  selectedArtist: Pick<ArtistItem, "id" | "name"> | null;
  onClose: () => void;
  handleArtist: (artistId: string) => void;
};

/** Affiche la modale de confirmation pour supprimer un artiste.
 * Ouvre une confirmation, lance la requete DELETE et affiche l'etat succes/erreur.
 * @param {DeleteArtistModalProps} props Proprietes de controle de la modale.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {Pick<ArtistItem, "id" | "name"> | null} props.selectedArtist Artiste selectionne pour la suppression.
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
  const { handleDelete, isSubmitting, isDeleted, error: submitError } = useDelete("/admin/artists");

  // Reinitialise l'etat interne et ferme la modale
  const handleClose = () => onClose();

  // Confirme la suppression et met a jour l'UI selon la reponse API
  const handleConfirmDelete = () => {
    if (!selectedArtist) return;
    handleDelete(selectedArtist.id, handleArtist);
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