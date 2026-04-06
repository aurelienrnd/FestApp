"use client";

import type { ArticleRow } from "../../../types";

/** Modale de detail d'un article. A implementer. */
export default function NewsDetailModal(_props: {
  isOpen: boolean;
  onClose: () => void;
  article: ArticleRow | null;
}) {
  return null;
}
