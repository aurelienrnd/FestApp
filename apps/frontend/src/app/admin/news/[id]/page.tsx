"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "../../../../hooks/useRoleGuard";
import { apiRequest } from "../../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../../functions/getApiErrorMessage";
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
  const [article, setArticle] = useState<ArticleItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getArticle = async () => {
      setIsLoading(true);
      setError(null);

      const result = await apiRequest<{ article: ArticleItem }>(`/public/news/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (result.error) {
        setError(getApiErrorMessage(result.error));
        setIsLoading(false);
        return;
      }

      setArticle(result.data?.article ?? null);
      setIsLoading(false);
    };

    getArticle();
  }, [id]);

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
