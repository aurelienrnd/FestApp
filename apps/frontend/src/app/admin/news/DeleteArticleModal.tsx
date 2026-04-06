"use client";

import type { ArticleRow } from "../../../types";

/** Modale de confirmation de suppression d'un article. A implementer. */
export default function DeleteArticleModal(_props: {
  isOpen: boolean;
  selectedArticle: ArticleRow | null;
  onClose: () => void;
  handleArticle: (articleId: string) => void;
}) {
  return null;
}
