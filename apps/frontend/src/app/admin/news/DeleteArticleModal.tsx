"use client";

import { useState } from "react";
import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import {
  type ApiMessageResponse,
  apiRequest,
} from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";
import type { ArticleRow } from "../../../type";

type DeleteArticleModalProps = {
  isOpen: boolean;
  selectedArticle: Pick<ArticleRow, "id" | "title"> | null;
  onClose: () => void;
  handleArticle: (articleId: string) => void;
};

/** Affiche la modale de confirmation pour supprimer un article.
 * Ouvre une confirmation, lance la requete DELETE et affiche l'etat succes/erreur.
 * @param {DeleteArticleModalProps} props Proprietes de controle de la modale.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {Pick<ArticleRow, "id" | "title"> | null} props.selectedArticle Article selectionne pour la suppression.
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
  // Etats de la suppression : en cours, erreur, succes.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);

  // Reinitialise les etats et ferme la modale.
  const handleClose = () => {
    setIsSubmitting(false);
    setSubmitError(null);
    setIsDeleted(false);
    onClose();
  };

  // Confirme la suppression et met a jour l'UI selon la reponse API.
  const handleConfirmDelete = async () => {
    // Si aucun article n'est selectionne, on ne fait rien.
    if (!selectedArticle) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // Lance la requete de suppression.
    const result = await apiRequest<ApiMessageResponse>(
      `/admin/articles/${selectedArticle.id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );

    // Si la reponse contient une erreur, on affiche le message d'erreur.
    if (result.error) {
      setSubmitError(getApiErrorMessage(result.error));
      setIsSubmitting(false);
      return;
    }

    // Si la suppression est reussie, on met a jour la liste des articles et on affiche le message de succes.
    handleArticle(selectedArticle.id);
    setIsDeleted(true);
    setIsSubmitting(false);
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
