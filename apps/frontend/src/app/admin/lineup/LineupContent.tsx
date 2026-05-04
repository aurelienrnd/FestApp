"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiRequest } from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";
import AddArtistModal from "./AddArtistModal";
import DeleteArtistModal from "./DeleteArtistModal";
import { useNavPath } from "../../../hooks/useNavPath";
import type { ArtistListRow } from "../../../types";
import LoadingLine from "../../../components/LoadingLine";

type ListArtistsResponse = { artists: ArtistListRow[] };

/** Affiche la liste des artistes filtrée par jour si activeFilter est defini.
 * Recupere les artistes via l'API puis affiche un etat de chargement/erreur.
 * @function apiRequest Envoie une requete HTTP a l'API avec `fetch`
 * @function getApiErrorMessage Definit un message a retourner selon le statut de l'erreur
 * @param {string} props.basePath Prefixe de route pour les liens de detail artiste (ex : "/lineup" ou "/admin/lineup").
 * @param {boolean} props.isAddModalOpen Ouvre la modale d'ajout artiste.
 * @param {() => void} props.onCloseAddModal Ferme la modale d'ajout artiste.
 * @param {string | null} props.activeFilter utilisee pour filtrer les artistes par jour — null affiche tous les artistes.
 * @children AddArtistModal - Affiche la modale d'ajout ou d'edition d'artiste.
 * @function handleArtistAdded Ajoute l'artiste cree a la liste locale et ferme la modale.
 */
export default function LineupContent({
  basePath,
  isAddModalOpen = false,
  onCloseAddModal = () => {},
  activeFilter = null,
}: {
  basePath: string;
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

  // Convertit un timestamp ISO en minutes depuis minuit (heure seule), -1 si absent
  const toMinutes = (iso: string | null | undefined) => {
    if (!iso) return -1;
    const d = new Date(iso);
    return d.getHours() * 60 + d.getMinutes();
  };

  // Filtre par date selectionnee puis trie par heure decroissante (plus tardif en haut)
  const visibleArtists = (
    activeFilter
      ? artists.filter((a) => a.start_time?.startsWith(activeFilter))
      : artists
  ).sort((a, b) => toMinutes(b.start_time) - toMinutes(a.start_time));

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
                  <div className="flex flex-col gap-1">
                    <span className="card-primary">{artist.name}</span>
                    <span className="card-secondary uppercase">
                      {artist.stage ?? "Scène non définie"}
                    </span>
                    {isAdminPath && artist.is_featured && (
                      <span className="inline-flex items-center rounded-full bg-(--color-1) px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                        Page d&apos;accueil
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 card-secondary">
                    <span>
                      {artist.start_time
                        ? new Date(artist.start_time).toLocaleDateString(
                            "fr-FR",
                            { weekday: "long", day: "numeric", month: "long" },
                          )
                        : "Date non définie"}
                    </span>
                    <span>
                      {artist.start_time
                        ? new Date(artist.start_time).toLocaleTimeString(
                            "fr-FR",
                            { hour: "2-digit", minute: "2-digit" },
                          )
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="card-lineup-actions">
                  <Link href={`${basePath}/${artist.id}`} className="btn-cta">
                    Voir plus
                  </Link>
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

    </div>
  );
}
