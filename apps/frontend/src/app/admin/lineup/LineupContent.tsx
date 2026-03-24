"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiRequest } from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";
import AddArtistModal from "./AddArtistModal";
import DeleteArtistModal from "./DeleteArtistModal";
import { useNavPath } from "../../../hooks/useNavPath";
import type { ArtistListRow } from "../../../types";

type ListArtistsResponse = { artists: ArtistListRow[] };

/** Affiche la liste des artistes.
 * Recupere les artistes via l'API puis affiche un etat de chargement/erreur.
 * @function apiRequest Envoie une requete HTTP a l'API avec `fetch`
 * @function getApiErrorMessage Definit un message a retourner selon le statut de l'erreur
 * @param {boolean} isAddModalOpen Ouvre la modale d'ajout artiste.
 * @param {() => void} onCloseAddModal Ferme la modale d'ajout artiste.
 * @children AddArtistModal - Affiche la modale d'ajout d'artiste.
 * @function handleArtistAdded Ajoute l'artiste cree a la liste locale et ferme la modale.
 */
export default function LineupContent({
  isAddModalOpen = false,
  onCloseAddModal = () => {},
}: {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}) {
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

  return (
    <div className="flex-1 flex justify-center">
      <div className="w-full max-w-5xl">
        {isLoading ? (
          <p className="text-center">Chargement...</p>
        ) : error ? (
          <p className="text-center text-(--color-1)">{error}</p>
        ) : artists.length === 0 ? (
          <div className="flex h-full justify-center items-center">
            <p>Aucun artiste.</p>
          </div>
        ) : (
          <ul className="flex w-full flex-col items-center gap-(--space-md)">
            {artists.map((artist) => (
              <li key={artist.id} className="card-row">
                <div className="card-media-img-wrapper">
                  <Image
                    src={artist.url_media}
                    alt={artist.description_media}
                    fill
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
                  <button type="button" className="btn-cta">
                    Voir plus
                  </button>
                  {isAdminPath && (
                    <>
                      <button
                        type="button"
                        className="btn-type-2 rounded-md border border-(--color-text-input) p-(--space-xs)"
                        onClick={() => openEditModal(artist)}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="btn-type-2 rounded-md border border-(--color-text-input) p-(--space-xs)"
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
    </div>
  );
}
