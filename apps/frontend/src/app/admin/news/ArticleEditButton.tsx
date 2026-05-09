"use client";

import type { ArticleItem } from "../../../type";
import { useModal } from "../../../hooks/useModal";
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
  const { isOpen, open, close } = useModal();

  const handleArticleEdited = (updatedArticle: ArticleItem) => {
    onArticleEdited(updatedArticle);
    close();
  };

  return (
    <>
      <div className="detail-edit-area">
        <button
          type="button"
          className="btn-cta"
          onClick={() => open()}
        >
          Modifier
        </button>
      </div>
      <AddArticleModal
        isOpen={isOpen}
        onClose={close}
        handleArticle={handleArticleEdited}
        articleToEdit={article}
      />
    </>
  );
}
