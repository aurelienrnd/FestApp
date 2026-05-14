"use client";

import { useState } from "react";
import type { NewsItem } from "../../../type";
import { useModal } from "../../../hooks/useModal";
import AddNewsModal from "../../../components/modals/AddNewsModal";

/** Bouton d'édition et modale d'édition pour la page de détail news.
 * @param {NewsItem} props.news News à modifier.
 * @param {(news: NewsItem) => void} props.onNewsEdited Appelé avec la news mise à jour après édition réussie.
 */
export default function NewsEditButton({
  news,
  onNewsEdited,
}: {
  news: NewsItem;
  onNewsEdited: (news: NewsItem) => void;
}) {
  const { isOpen, open, close } = useModal();
  const [editKey, setEditKey] = useState(0);

  const handleNewsEdited = (updatedNews: NewsItem) => {
    onNewsEdited(updatedNews);
    close();
  };

  return (
    <>
      <div className="detail-edit-area">
        <button
          type="button"
          className="btn-cta"
          onClick={() => { setEditKey((k) => k + 1); open(); }}
        >
          Modifier
        </button>
      </div>
      <AddNewsModal
        key={editKey}
        isOpen={isOpen}
        onClose={close}
        handleNews={handleNewsEdited}
        newsToEdit={news}
      />
    </>
  );
}
