"use client";

import { useState } from "react";
import type { ArticleRow } from "../../../type";
import AddArticleModal from "./AddArticleModal";

/** Bouton d'édition et modale d'édition pour la page de détail article.
 * @param {ArticleRow} props.article Article à modifier.
 * @param {(article: ArticleRow) => void} props.onArticleEdited Appelé avec l'article mis à jour après édition réussie.
 */
export default function ArticleEditButton({
  article,
  onArticleEdited,
}: {
  article: ArticleRow;
  onArticleEdited: (article: ArticleRow) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleArticleEdited = (updatedArticle: ArticleRow) => {
    onArticleEdited(updatedArticle);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="detail-edit-area">
        <button
          type="button"
          className="btn-cta"
          onClick={() => setIsModalOpen(true)}
        >
          Modifier
        </button>
      </div>
      <AddArticleModal
        key={article.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        handleArticle={handleArticleEdited}
        articleToEdit={article}
      />
    </>
  );
}
