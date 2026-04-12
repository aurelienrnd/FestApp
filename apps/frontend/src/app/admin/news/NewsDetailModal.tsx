"use client";

import Image from "next/image";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import type { ArticleRow } from "../../../types";

type NewsDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  article: ArticleRow | null;
};

/** Formate une date ISO en "JJ MOIS AAAA" en français.
 * @param {string} isoString Date ISO 8601
 */
function formatArticleDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Affiche la modale de detail d'un article — image pleine largeur, titre (fond rouge),
 * contenu (si present), auteur et date de publication.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {() => void} props.onClose Ferme la modale.
 * @param {ArticleRow | null} props.article Article a afficher.
 * @function formatArticleDate Formate une date ISO en "JJ MOIS AAAA" en français.
 */
export default function NewsDetailModal({
  isOpen,
  onClose,
  article,
}: NewsDetailModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Detail article"
      className="modal-detail"
      overlayClassName="modal-overlay"
    >
      {article && (
        <div className="detail-layout">
          {/* Image pleine largeur avec bouton fermer */}
          <div className="detail-img-wrapper">
            <Image
              src={article.url_media}
              alt={article.description_media}
              fill
              className="object-cover"
            />
            <button
              type="button"
              className="detail-close-btn"
              onClick={onClose}
              aria-label="Fermer la modal"
            >
              <FontAwesomeIcon icon={faX} />
            </button>
          </div>

          {/* Titre sur fond rouge */}
          <div className="detail-name-block">
            <h2 className="detail-name">{article.title}</h2>
          </div>

          {/* Contenu (optionnel) */}
          {article.content && (
            <div className="detail-bio">
              <p>{article.content}</p>
            </div>
          )}

          {/* Auteur et date */}
          <div className="detail-date-block">
            <p>{article.author_name ?? "Auteur inconnu"}</p>
            <p>{formatArticleDate(article.created_at)}</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
