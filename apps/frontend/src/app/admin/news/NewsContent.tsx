"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { apiRequest } from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";
import { useNavPath } from "../../../hooks/useNavPath";
import type { ArticleRow } from "../../../types";
import LoadingLine from "../../../components/LoadingLine";
import AddArticleModal from "./AddArticleModal";
import DeleteArticleModal from "./DeleteArticleModal";

type ListArticlesResponse = { articles: ArticleRow[] };

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

  // Stocke les articles, l'état de chargement et les erreurs éventuelles
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Récupère les articles à l'affichage du composant
  useEffect(() => {
    // Fonction asynchrone pour récupérer les articles depuis l'API
    const getArticles = async () => {
      // Initialise le chargement et réinitialise les erreurs
      setIsLoading(true);
      setError(null);

      // Effectue la requête API pour récupérer les articles
      const result = await apiRequest<ListArticlesResponse>("/public/news", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      // En cas d'erreur, stocke le message d'erreur et arrête le chargement
      if (result.error) {
        setError(getApiErrorMessage(result.error));
        setIsLoading(false);
        return;
      }

      // En cas de succès, stocke les articles récupérés et arrête le chargement
      setArticles(result.data?.articles ?? []);
      setIsLoading(false);
    };

    getArticles();
  }, []);

  // États pour gérer les modales d'édition, de visualisation et de suppression
  const [articleToEdit, setArticleToEdit] = useState<ArticleRow | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedArticleToDelete, setSelectedArticleToDelete] =
    useState<ArticleRow | null>(null);

  // Ouvre la modale de confirmation de suppression et stocke l'article sélectionné
  const openDeleteModal = (article: ArticleRow) => {
    setSelectedArticleToDelete(article);
    setIsDeleteModalOpen(true);
  };

  // Supprime l'article de la liste après confirmation de suppression
  const handleArticleDeleted = (articleId: string) => {
    setArticles((current) => current.filter((a) => a.id !== articleId));
  };

  // Ferme la modale de suppression et réinitialise l'article sélectionné
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedArticleToDelete(null);
  };

  // Ajoute le nouvel article à la liste après ajout réussi
  const handleArticleAdded = (article: ArticleRow) => {
    setArticles((current) => [...current, article]);
    onCloseAddModal();
  };

  // Ouvre la modale d'édition et stocke l'article à éditer
  const openEditModal = (article: ArticleRow) => {
    setArticleToEdit(article);
    setIsEditModalOpen(true);
  };

  // Met à jour l'article dans la liste après édition réussie, puis ferme la modale d'édition
  const handleArticleEdited = (article: ArticleRow) => {
    setArticles((current) =>
      current.map((a) => (a.id === article.id ? article : a)),
    );
    setIsEditModalOpen(false);
    setArticleToEdit(null);
  };

  // Ferme la modale d'édition et réinitialise l'article à éditer
  const closeModal = () => {
    setIsEditModalOpen(false);
    setArticleToEdit(null);
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
                    {new Date(article.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="card-lineup-actions">
                  <Link href={`${basePath}/${article.id}`} className="btn-cta">
                    Voir plus
                  </Link>

                  {isAdminPath && (
                    <>
                      <button
                        type="button"
                        className="btn-action"
                        onClick={() => openEditModal(article)}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="btn-action"
                        onClick={() => openDeleteModal(article)}
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddArticleModal
        key={articleToEdit?.id ?? "new"}
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={closeModal}
        handleArticle={
          isEditModalOpen ? handleArticleEdited : handleArticleAdded
        }
        articleToEdit={articleToEdit}
      />

      <DeleteArticleModal
        isOpen={isDeleteModalOpen}
        selectedArticle={selectedArticleToDelete}
        onClose={closeDeleteModal}
        handleArticle={handleArticleDeleted}
      />
    </div>
  );
}
