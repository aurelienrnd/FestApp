"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Image from "next/image";
import { useFetch } from "../hooks/useFetch";
import { useModal } from "../hooks/useModal";
import { useNavPath } from "../hooks/useNavPath";
import type { NewsItem } from "../type";
import LoadingLine from "./LoadingLine";
import { formatDateLong } from "../functions/formatDate";
import AddNewsModal from "./modals/AddNewsModal";
import DeleteModal from "./modals/DeleteModal";

type NewsSummary = Omit<NewsItem, "content">;

/** Affiche la liste des news avec tri client-side selon activeFilter.
 * Recupere les news via GET /public/news.
 * En vue admin, affiche un badge "Brouillon" sur les news non publiees et les boutons Modifier/Supprimer.
 * @param {boolean} props.isAddModalOpen Ouvre la modale d'ajout news.
 * @param {() => void} props.onCloseAddModal Ferme la modale d'ajout news.
 * @param {string | null} props.activeFilter Filtre de tri — "Croissant" inverse l'ordre, null ou "Decroissant" conserve l'ordre DESC de l'API.
 * @function useFetch Récupère les news depuis l'API.
 * @function useModal Gère l'état de la modale de suppression.
 * @function useNavPath Détermine si on est sur une page admin pour afficher les actions d'édition/suppression.
 * @function formatDateLong Formate la date de création des news.
 * @children LoadingLine - Affiche une ligne de chargement pendant la récupération des données.
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

  // Récupère les news depuis l'API
  const { data, isLoading, error } = useFetch<{ news: NewsSummary[] }>(
    "/public/news",
  );

  const [addedNews, setAddedNews] = useState<NewsSummary[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Gère l'ouverture et la fermeture de la modale de suppression de news
  const {
    isOpen: isDeleteModalOpen,
    item: selectedNewsToDelete,
    open: openDeleteModal,
    close: closeDeleteModal,
  } = useModal<NewsSummary>();

  // Ajoute l'id de la news supprimée à la liste des ids supprimés pour le filtrage
  const handleNewsDeleted = (newsId: string) => {
    setDeletedIds((current) => new Set([...current, newsId]));
  };

  // Ajoute la news ajoutée à la liste des news ajoutées pour le filtrage
  const handleNewsAdded = (news: NewsItem) => {
    setAddedNews((current) => [...current, news]);
    onCloseAddModal();
  };

  // Filtrage des news à afficher
  const filteredNews = useMemo(() => {
    const baseNews = data?.news ?? [];
    // Fusionne les news de base, les news ajoutées et filtre les news supprimées
    const merged = [
      ...addedNews.filter((news) => !deletedIds.has(news.id)),
      ...baseNews.filter((news) => !deletedIds.has(news.id)),
    ];

    // En vue admin, affiche toutes les news, sinon filtre pour n'afficher que les news publiées
    const published = isAdminPath
      ? merged
      : merged.filter((news) => news.is_published);

    // Trie les news par date de création, ordre croissant ou décroissant selon activeFilter
    return activeFilter === "Plus ancien"
      ? [...published].reverse()
      : published;
  }, [data, addedNews, deletedIds, activeFilter, isAdminPath]);

  return (
    <div className="admin-content-wrapper">
      <div className="w-full max-w-5xl">
        {isLoading ? (
          <LoadingLine />
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : filteredNews.length === 0 ? (
          <div className="content-centered">
            <p>Aucune news.</p>
          </div>
        ) : (
          <ul className="flex w-full flex-col items-center gap-6">
            {filteredNews.map((news, index) => (
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

                <div className="card-artists-content">
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

                <div className="card-artists-actions">
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
