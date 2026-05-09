"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useFetch } from "../hooks/useFetch";
import { useModal } from "../hooks/useModal";
import { useNavPath } from "../hooks/useNavPath";
import type { ArticleItem } from "../type";

type ArticleSummary = Omit<ArticleItem, "content">;
import LoadingLine from "./LoadingLine";
import { formatDateLong } from "../functions/formatDate";
import AddArticleModal from "./AddArticleModal";
import DeleteModal from "./DeleteModal";

/** Affiche la liste des articles avec tri client-side selon activeFilter.
 * Recupere les articles via GET /public/news.
 * En vue admin, affiche un badge "Brouillon" sur les articles non publies et les boutons Modifier/Supprimer.
 * @param {boolean} props.isAddModalOpen Ouvre la modale d'ajout article.
 * @param {() => void} props.onCloseAddModal Ferme la modale d'ajout article.
 * @param {string | null} props.activeFilter Filtre de tri — "Croissant" inverse l'ordre, null ou "Decroissant" conserve l'ordre DESC de l'API.
 * @children AddArticleModal - Affiche la modale d'ajout ou d'edition d'article.
 * @children DeleteArticleModal - Affiche la modale de confirmation de suppression.
 */
export default function NewsContent({
  isAddModalOpen = false,
  onCloseAddModal = () => {},
  activeFilter = null,
}: {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
  activeFilter?: string | null;
}) {
  // Permet d'afficher les boutons d'édition/suppression et le badge "Brouillon" uniquement sur les pages admin (ex: /admin/news)
  const { isAdminPath } = useNavPath();
  const basePath = isAdminPath ? "/admin/news" : "/news";

  const { data, isLoading, error } = useFetch<{ articles: ArticleSummary[] }>("/public/news");

  // Liste mutable pour les ajouts et suppressions locaux
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  useEffect(() => {
    setArticles(data?.articles ?? []);
  }, [data]);

  const {
    isOpen: isDeleteModalOpen,
    item: selectedArticleToDelete,
    open: openDeleteModal,
    close: closeDeleteModal,
  } = useModal<ArticleSummary>();

  // Supprime l'article de la liste après confirmation de suppression
  const handleArticleDeleted = (articleId: string) => {
    setArticles((current) => current.filter((a) => a.id !== articleId));
  };

  // Ajoute le nouvel article à la liste après ajout réussi
  const handleArticleAdded = (article: ArticleItem) => {
    setArticles((current) => [...current, article]);
    onCloseAddModal();
  };

  // Sur la page publique, masque les brouillons meme si l'API les retourne (admin connecte)
  const publishedArticles = isAdminPath
    ? articles
    : articles.filter((a) => a.is_published);

  // Tri cote client — "Croissant" inverse l'ordre DESC retourne par l'API (plus ancien en premier)
  const visibleArticles =
    activeFilter === "Croissant"
      ? [...publishedArticles].reverse()
      : publishedArticles;

  return (
    <div className="admin-content-wrapper">
      <div className="w-full max-w-5xl">
        {isLoading ? (
          <LoadingLine />
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : visibleArticles.length === 0 ? (
          <div className="content-centered">
            <p>Aucun article.</p>
          </div>
        ) : (
          <ul className="flex w-full flex-col items-center gap-6">
            {visibleArticles.map((article, index) => (
              <li key={article.id} className="card-row">
                <div className="card-media-img-wrapper">
                  <Image
                    src={article.url_media}
                    alt={article.description_media}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 192px"
                    className="card-media-img"
                  />
                </div>

                <div className="card-lineup-content">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="card-primary">{article.title}</span>
                      {isAdminPath && !article.is_published && (
                        <span className="text-xs px-2 py-1 rounded border border-(--color-1) text-(--color-1)">
                          Brouillon
                        </span>
                      )}
                    </div>
                    <span className="card-secondary">
                      {article.author_name ?? "Auteur inconnu"}
                    </span>
                  </div>

                  <span className="card-secondary">
                    {formatDateLong(article.created_at)}
                  </span>
                </div>

                <div className="card-lineup-actions">
                  <Link href={`${basePath}/${article.id}`} className="btn-cta">
                    Voir plus
                  </Link>

                  {isAdminPath && (
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => openDeleteModal(article)}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddArticleModal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        handleArticle={handleArticleAdded}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        item={selectedArticleToDelete}
        onClose={closeDeleteModal}
        onDeleted={handleArticleDeleted}
        endpoint="/admin/articles"
        entityName="article"
        getLabel={(a) => a.title}
      />
    </div>
  );
}
