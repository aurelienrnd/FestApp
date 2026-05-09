"use client";

import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import { useDelete } from "../../../hooks/useDelete";
import type { ArticleItem } from "../../../type";

type DeleteArticleModalProps = {
  isOpen: boolean;
  selectedArticle: Pick<ArticleItem, "id" | "title"> | null;
  onClose: () => void;
  handleArticle: (articleId: string) => void;
};

/** Affiche la modale de confirmation pour supprimer un article.
 * Ouvre une confirmation, lance la requete DELETE et affiche l'etat succes/erreur.
 * @param {DeleteArticleModalProps} props Proprietes de controle de la modale.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {Pick<ArticleItem, "id" | "title"> | null} props.selectedArticle Article selectionne pour la suppression.
 * @param {() => void} props.onClose Ferme la modale.
 * @param {(articleId: string) => void} props.handleArticle Met a jour la liste des articles et ferme la modale.
 * @children ModalCloseButton Ferme la modale.
 */
export default function DeleteArticleModal({
  isOpen,
  selectedArticle,
  onClose,
  handleArticle,
}: DeleteArticleModalProps) {
  const { handleDelete, isSubmitting, isDeleted, error: submitError, reset } = useDelete("/admin/articles");

  // Reinitialise les etats et ferme la modale.
  const handleClose = () => {
    reset();
    onClose();
  };

  // Confirme la suppression et met a jour l'UI selon la reponse API.
  const handleConfirmDelete = () => {
    if (!selectedArticle) return;
    handleDelete(selectedArticle.id, handleArticle);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Suppression article"
      className="modal"
      overlayClassName="modal-overlay"
    >
      <ModalCloseButton onClose={handleClose} />
      <h2 className="title-modal">Suppression article</h2>

      <div className="m-6">
        {isDeleted ? (
          <div className="form-modal">
            <p className="text-center">L&apos;article a ete supprime.</p>
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
              <strong>{selectedArticle?.title ?? "cet article"}</strong> ?
            </p>

            <div className="submit-modal-area">
              <button
                type="button"
                className="btn-cta"
                onClick={handleConfirmDelete}
                disabled={isSubmitting || !selectedArticle}
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
