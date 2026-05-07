"use client";

import { useState } from "react";
import type { ArticleItem } from "../../../type";
import AddArticleModal from "./AddArticleModal";

/** Bouton d'édition et modale d'édition pour la page de détail article.
 * @param {ArticleItem} props.article Article à modifier.
 * @param {(article: ArticleItem) => void} props.onArticleEdited Appelé avec l'article mis à jour après édition réussie.
 */
export default function ArticleEditButton({
  article,
  onArticleEdited,
}: {
  article: ArticleItem;
  onArticleEdited: (article: ArticleItem) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleArticleEdited = (updatedArticle: ArticleItem) => {
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
