"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "../../../../hooks/useRoleGuard";
import { useFetch } from "../../../../hooks/useFetch";
import type { NewsItem } from "../../../../type";
import NewsDetailContent from "../../../../components/NewsDetailContent";
import NewsEditButton from "../NewsEditButton";

/** Page admin de détail d'une news — permet la prévisualisation des brouillons.
 * Récupère la news via GET /public/news/:id avec les cookies d'auth.
 * Les restrictions de rôle de /admin/news s'appliquent automatiquement via useRoleGuard.
 */
export default function AdminNewsPage() {
  useRoleGuard();

  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useFetch<{ news: NewsItem }>(`/public/news/${id}`);

  // État mutable pour les mises à jour locales après édition
  const [news, setNews] = useState<NewsItem | null>(null);
  useEffect(() => {
    setNews(data?.news ?? null);
  }, [data]);

  if (isLoading) return null;
  if (error || !news) return <p className="content-centered">{error}</p>;

  return (
    <>
      <NewsDetailContent news={news} />
      <NewsEditButton
        news={news}
        onNewsEdited={(updated) => setNews(updated)}
      />
    </>
  );
}
