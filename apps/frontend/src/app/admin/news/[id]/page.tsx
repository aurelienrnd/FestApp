"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "../../../../hooks/useRoleGuard";
import { useFetch } from "../../../../hooks/useFetch";
import type { NewsItem } from "../../../../type";
import NewsDetailContent from "../../../../components/NewsDetailContent";
import NewsEditButton from "../NewsEditButton";
import LoadingLine from "../../../../components/LoadingLine";

/** Page admin de détail d'une news — permet la prévisualisation des brouillons.
 * Récupère la news via GET /public/news/:id avec les cookies d'auth.
 * Les restrictions de rôle de /admin/news s'appliquent automatiquement via useRoleGuard.
 */
export default function AdminNewsPage() {
  useRoleGuard();

  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useFetch<{ news: NewsItem }>(`/public/news/${id}`);

  // Stocke uniquement la valeur après édition — null tant que l'utilisateur n'a pas modifié
  const [editedNews, setEditedNews] = useState<NewsItem | null>(null);
  const news = editedNews ?? data?.news ?? null;

  if (isLoading) return <LoadingLine />;
  if (error || !news) return <p className="content-centered">{error}</p>;

  return (
    <>
      <NewsDetailContent news={news} />
      <NewsEditButton
        news={news}
        onNewsEdited={(updated) => setEditedNews(updated)}
      />
    </>
  );
}
