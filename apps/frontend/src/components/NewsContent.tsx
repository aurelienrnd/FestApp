"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useFetch } from "../hooks/useFetch";
import { useModal } from "../hooks/useModal";
import { useNavPath } from "../hooks/useNavPath";
import type { NewsItem } from "../type";

type NewsSummary = Omit<NewsItem, "content">;
import LoadingLine from "./LoadingLine";
import { formatDateLong } from "../functions/formatDate";
import AddNewsModal from "./modals/AddNewsModal";
import DeleteModal from "./modals/DeleteModal";

/** Affiche la liste des news avec tri client-side selon activeFilter.
 * Recupere les news via GET /public/news.
 * En vue admin, affiche un badge "Brouillon" sur les news non publiees et les boutons Modifier/Supprimer.
 * @param {boolean} props.isAddModalOpen Ouvre la modale d'ajout news.
 * @param {() => void} props.onCloseAddModal Ferme la modale d'ajout news.
 * @param {string | null} props.activeFilter Filtre de tri — "Croissant" inverse l'ordre, null ou "Decroissant" conserve l'ordre DESC de l'API.
 * @children AddNewsModal - Affiche la modale d'ajout ou d'edition de news.
 * @children DeleteModal - Affiche la modale de confirmation de suppression.
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

  const { data, isLoading, error } = useFetch<{ newsList: NewsSummary[] }>("/public/news");

  // Liste mutable pour les ajouts et suppressions locaux
  const [newsList, setNewsList] = useState<NewsSummary[]>([]);
  useEffect(() => {
    setNewsList(data?.newsList ?? []);
  }, [data]);

  const {
    isOpen: isDeleteModalOpen,
    item: selectedNewsToDelete,
    open: openDeleteModal,
    close: closeDeleteModal,
  } = useModal<NewsSummary>();

  // Supprime la news de la liste après confirmation de suppression
  const handleNewsDeleted = (newsId: string) => {
    setNewsList((current) => current.filter((n) => n.id !== newsId));
  };

  // Ajoute la nouvelle news à la liste après ajout réussi
  const handleNewsAdded = (news: NewsItem) => {
    setNewsList((current) => [...current, news]);
    onCloseAddModal();
  };

  // Filtre les brouillons et applique le tri — memoïse pour eviter de recalculer
  // lors des re-renders sans rapport (ouverture modale, etc.)
  const visibleNewsList = useMemo(() => {
    const published = isAdminPath
      ? newsList
      : newsList.filter((n) => n.is_published);
    return activeFilter === "Croissant" ? [...published].reverse() : published;
  }, [newsList, activeFilter, isAdminPath]);

  return (
    <div className="admin-content-wrapper">
      <div className="w-full max-w-5xl">
        {isLoading ? (
          <LoadingLine />
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : visibleNewsList.length === 0 ? (
          <div className="content-centered">
            <p>Aucune news.</p>
          </div>
        ) : (
          <ul className="flex w-full flex-col items-center gap-6">
            {visibleNewsList.map((news, index) => (
              <li key={news.id} className="card-row">
                <div className="card-media-img-wrapper">
                  <Image
                    src={news.url_media}
                    alt={news.description_media}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 192px"
                    className="card-media-img"
                  />
                </div>

                <div className="card-lineup-content">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="card-primary">{news.title}</span>
                      {isAdminPath && !news.is_published && (
                        <span className="text-xs px-2 py-1 rounded border border-(--color-1) text-(--color-1)">
                          Brouillon
                        </span>
                      )}
                    </div>
                    <span className="card-secondary">
                      {news.author_name ?? "Auteur inconnu"}
                    </span>
                  </div>

                  <span className="card-secondary">
                    {formatDateLong(news.created_at)}
                  </span>
                </div>

                <div className="card-lineup-actions">
                  <Link href={`${basePath}/${news.id}`} className="btn-cta">
                    Voir plus
                  </Link>

                  {isAdminPath && (
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => openDeleteModal(news)}
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

      <AddNewsModal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        handleNews={handleNewsAdded}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        item={selectedNewsToDelete}
        onClose={closeDeleteModal}
        onDeleted={handleNewsDeleted}
        endpoint="/admin/news"
        entityName="news"
        getLabel={(n) => n.title}
      />
    </div>
  );
}
