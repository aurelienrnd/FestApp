"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiRequest } from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";
import AddArtistModal from "./AddArtistModal";
import DeleteArtistModal from "./DeleteArtistModal";
import ArtistDetailModal from "./ArtistDetailModal";
import { useNavPath } from "../../../hooks/useNavPath";
import type { ArtistListRow } from "../../../types";
import LoadingLine from "../../../components/LoadingLine";

type ListArtistsResponse = { artists: ArtistListRow[] };

/** Affiche la liste des artistes filtrée par jour si activeFilter est defini.
 * Recupere les artistes via l'API puis affiche un etat de chargement/erreur.
 * @function apiRequest Envoie une requete HTTP a l'API avec `fetch`
 * @function getApiErrorMessage Definit un message a retourner selon le statut de l'erreur
 * @param {boolean} props.isAddModalOpen Ouvre la modale d'ajout artiste.
 * @param {() => void} props.onCloseAddModal Ferme la modale d'ajout artiste.
 * @param {string | null} props.activeFilter utilisee pour filtrer les artistes par jour — null affiche tous les artistes.
 * @children AddArtistModal - Affiche la modale d'ajout ou d'edition d'artiste.
 * @children ArtistDetailModal - Affiche la modale de detail d'un artiste.
 * @function handleArtistAdded Ajoute l'artiste cree a la liste locale et ferme la modale.
 */
export default function LineupContent({
  isAddModalOpen = false,
  onCloseAddModal = () => {},
  activeFilter = null,
}: {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
  activeFilter?: string | null;
}) {
  // Verifie si le chemin d'acces contient "/admin" pour afficher les boutons de modification/suppression
  const { isAdminPath } = useNavPath();

  // Etats lies aux donnees
  const [artists, setArtists] = useState<ArtistListRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charge la liste des artistes au montage du composant
  useEffect(() => {
    const getArtists = async () => {
      // Active le chargement et reinitialise les erreurs
      setIsLoading(true);
      setError(null);

      // Appel API pour recuperer la liste des artistes
      const result = await apiRequest<ListArtistsResponse>("/public/lineup", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      // Gestion des erreurs API
      if (result.error) {
        setError(getApiErrorMessage(result.error));
        setIsLoading(false);
        return;
      }

      // Mise a jour de la liste des artistes
      setArtists(result.data?.artists ?? []);
      setIsLoading(false);
    };

    getArtists();
  }, []);

  // Artiste en cours d'edition (null = mode ajout)
  const [artistToEdit, setArtistToEdit] = useState<ArtistListRow | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Artiste selectionne pour la modale de detail
  const [artistToView, setArtistToView] = useState<ArtistListRow | null>(null);

  // Etats lies a la suppression d'un artiste
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedArtistToDelete, setSelectedArtistToDelete] =
    useState<ArtistListRow | null>(null);

  // Ouvre la modale de suppression pour l'artiste selectionne
  const openDeleteModal = (artist: ArtistListRow) => {
    setSelectedArtistToDelete(artist);
    setIsDeleteModalOpen(true);
  };

  // Retire l'artiste supprime de la liste locale
  const handleArtistDeleted = (artistId: string) => {
    setArtists((current) => current.filter((a) => a.id !== artistId));
  };

  // Ferme la modale de suppression et reinitialise l'artiste selectionne
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedArtistToDelete(null);
  };

  // Ajoute l'artiste cree a la liste locale puis ferme la modale
  const handleArtistAdded = (artist: ArtistListRow) => {
    setArtists((current) => [...current, artist]);
    onCloseAddModal();
  };

  // Ouvre la modale d'edition pour l'artiste selectionne
  const openEditModal = (artist: ArtistListRow) => {
    setArtistToEdit(artist);
    setIsEditModalOpen(true);
  };

  // Met a jour l'artiste modifie dans la liste locale puis ferme la modale
  const handleArtistEdited = (artist: ArtistListRow) => {
    setArtists((current) =>
      current.map((a) => (a.id === artist.id ? artist : a)),
    );
    setIsEditModalOpen(false);
    setArtistToEdit(null);
  };

  // Ferme la modale (ajout ou edition) et reinitialise l'artiste selectionne
  const closeModal = () => {
    setIsEditModalOpen(false);
    setArtistToEdit(null);
    onCloseAddModal();
  };

  // Filtre les artistes selon la date selectionnee — null affiche tous les artistes
  const visibleArtists = activeFilter
    ? artists.filter((a) => a.start_time?.startsWith(activeFilter))
    : artists;

  return (
    <div className="admin-content-wrapper">
      <div className="w-full max-w-5xl">
        {isLoading ? (
          <LoadingLine />
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : visibleArtists.length === 0 ? (
          <div className="content-centered">
            <p>Aucun artiste.</p>
          </div>
        ) : (
          <ul className="flex w-full flex-col items-center gap-6">
            {visibleArtists.map((artist, index) => (
              <li key={artist.id} className="card-row">
                <div className="card-media-img-wrapper">
                  <Image
                    src={artist.url_media}
                    alt={artist.description_media}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 192px"
                    className="card-media-img"
                  />
                </div>

                <div className="card-lineup-content">
                  <span>{artist.name}</span>
                  <span>{artist.stage ?? "Scene non definie"}</span>
                  <span>
                    {artist.start_time
                      ? new Date(artist.start_time).toLocaleDateString(
                          "fr-FR",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          },
                        )
                      : "Date non definie"}
                  </span>
                  <span>
                    {artist.start_time
                      ? new Date(artist.start_time).toLocaleTimeString(
                          "fr-FR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : ""}
                  </span>
                </div>

                <div className="card-lineup-actions">
                  <button
                    type="button"
                    className="btn-cta"
                    onClick={() => setArtistToView(artist)}
                  >
                    Voir plus
                  </button>
                  {isAdminPath && (
                    <>
                      <button
                        type="button"
                        className="btn-action"
                        onClick={() => openEditModal(artist)}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="btn-action"
                        onClick={() => openDeleteModal(artist)}
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

      <AddArtistModal
        key={artistToEdit?.id ?? "new"}
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={closeModal}
        handleArtist={isEditModalOpen ? handleArtistEdited : handleArtistAdded}
        artistToEdit={artistToEdit}
      />

      <DeleteArtistModal
        isOpen={isDeleteModalOpen}
        selectedArtist={selectedArtistToDelete}
        onClose={closeDeleteModal}
        handleArtist={handleArtistDeleted}
      />

      <ArtistDetailModal
        isOpen={artistToView !== null}
        onClose={() => setArtistToView(null)}
        artist={artistToView}
      />
    </div>
  );
}
