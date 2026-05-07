"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "../../../../hooks/useRoleGuard";
import { useFetch } from "../../../../hooks/useFetch";
import type { ArticleItem } from "../../../../type";
import ArticleDetailContent from "../ArticleDetailContent";
import ArticleEditButton from "../ArticleEditButton";

/** Page admin de détail d'un article — permet la prévisualisation des brouillons.
 * Récupère l'article via GET /public/news/:id avec les cookies d'auth.
 * Les restrictions de rôle de /admin/news s'appliquent automatiquement via useRoleGuard.
 */
export default function AdminArticlePage() {
  useRoleGuard();

  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useFetch<{ article: ArticleItem }>(`/public/news/${id}`);

  // État mutable pour les mises à jour locales après édition
  const [article, setArticle] = useState<ArticleItem | null>(null);
  useEffect(() => {
    setArticle(data?.article ?? null);
  }, [data]);

  if (isLoading) return null;
  if (error || !article) return <p className="content-centered">{error}</p>;

  return (
    <>
      <ArticleDetailContent article={article} />
      <ArticleEditButton
        article={article}
        onArticleEdited={(updated) => setArticle(updated)}
      />
    </>
  );
}
