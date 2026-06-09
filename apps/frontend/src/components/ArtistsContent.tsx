"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFetch } from "../hooks/useFetch";
import { useModal } from "../hooks/useModal";
import AddArtistModal from "./modals/AddArtistModal";
import DeleteModal from "./modals/DeleteModal";
import { useNavPath } from "../hooks/useNavPath";
import type { ArtistItem } from "../type";
import LoadingLine from "./LoadingLine";
import { formatConcertDatetime } from "../functions/formatDate";

type ArtistSummary = Omit<
  ArtistItem,
  "bio" | "genre" | "origin" | "youtube_url" | "spotify_url" | "end_time"
>;

/** Affiche la liste des artistes filtrée par jour si activeFilter est defini.
 * Recupere les artistes via l'API puis affiche un etat de chargement/erreur.
 * @param {boolean} props.isAddModalOpen Ouvre la modale d'ajout artiste.
 * @param {() => void} props.onCloseAddModal Ferme la modale d'ajout artiste.
 * @param {string | null} props.activeFilter utilisee pour filtrer les artistes par jour — null affiche tous les artistes.
 * @function useFetch Recupere les artistes depuis l'API et gere les etats loading/error
 * @function useModal Gere l'ouverture et la fermeture de la modale de suppression d'artiste
 * @function useNavPath Verifie si le chemin d'acces contient "/admin" pour afficher les boutons de suppression
 * @function formatConcertDatetime Formate la date de concert pour l'affichage
 * @children LoadingLine - Affiche une ligne de chargement pendant la recuperation des artistes.
 * @children AddArtistModal - Affiche la modale d'ajout d'artiste.
 * @children DeleteModal - Affiche la modale de confirmation de suppression d'artiste
 */
export default function ArtistsContent({
  isAddModalOpen = false,
  onCloseAddModal = () => {},
  activeFilter = null,
}: {
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
  activeFilter?: string | null;
}) {
  // Verifie si le chemin d'acces contient "/admin" pour afficher ou non les boutons
  const { isAdminPath } = useNavPath();
  const basePath = isAdminPath ? "/admin/artists" : "/artists";

  // Recupere les artistes depuis l'API et gere les etats loading/error
  const { data, isLoading, error } = useFetch<{ artists: ArtistSummary[] }>(
    "/public/artists",
  );

  const [addedArtists, setAddedArtists] = useState<ArtistSummary[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Gere l'ouverture et la fermeture de la modale de suppression d'artiste
  const {
    isOpen: isDeleteModalOpen,
    item: selectedArtistToDelete,
    open: openDeleteModal,
    close: closeDeleteModal,
  } = useModal<ArtistSummary>();

  // Ajoute l'id de l'artiste supprime a la liste des ids supprimes pour le filtrage
  const handleArtistDeleted = (artistId: string) => {
    setDeletedIds((current) => new Set([...current, artistId]));
  };

  // Ajoute l'artiste ajoute a la liste des artistes ajoutes pour le filtrage
  const handleArtistAdded = (artist: ArtistItem) => {
    setAddedArtists((current) => [...current, artist]);
    onCloseAddModal();
  };

  // Convertit une date ISO en nombre de minutes depuis minuit pour le tri des artistes par heure de debut
  const toMinutes = (iso: string | null | undefined) => {
    if (!iso) return -1;
    const d = new Date(iso);
    return d.getHours() * 60 + d.getMinutes();
  };

  // filtrage des artistes a afficher
  const filteredArtists = useMemo(() => {
    const baseArtists = data?.artists ?? [];
    // Fusionne les artistes de base, les artistes ajoutes et filtre les artistes supprimes
    const merged = [
      ...addedArtists.filter((a) => !deletedIds.has(a.id)),
      ...baseArtists.filter((a) => !deletedIds.has(a.id)),
    ];

    // filtre les artistes par jour si activeFilter est defini, sinon affiche tous les artistes et trie les artistes par heure de debut decroissante
    return (
      activeFilter
        ? merged.filter((a) => a.start_time?.startsWith(activeFilter))
        : merged
    ).sort((a, b) => toMinutes(b.start_time) - toMinutes(a.start_time));
  }, [data, addedArtists, deletedIds, activeFilter]);

  return (
    <div className="admin-content-wrapper">
      <div className="w-full max-w-5xl">
        {isLoading ? (
          <LoadingLine />
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : filteredArtists.length === 0 ? (
          <div className="content-centered">
            <p>Aucun artiste.</p>
          </div>
        ) : (
          <ul className="flex w-full flex-col items-center gap-6">
            {filteredArtists.map((artist, index) => (
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

                <div className="card-artists-content">
                  <div className="flex flex-col gap-1">
                    <span className="card-primary">{artist.name}</span>
                    <span className="card-secondary uppercase">
                      {artist.stage ?? "Scène non définie"}
                    </span>
                    {isAdminPath && artist.is_featured && (
                      <span className="inline-flex self-start items-center rounded-full bg-(--color-1) px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                        Page d&apos;accueil
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 card-secondary">
                    {(() => {
                      const concert = artist.start_time
                        ? formatConcertDatetime(artist.start_time)
                        : null;
                      return (
                        <>
                          <span>
                            {concert ? concert.date : "Date non définie"}
                          </span>
                          <span>{concert ? concert.time : ""}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="card-artists-actions">
                  <Link href={`${basePath}/${artist.id}`} className="btn-cta">
                    Voir plus
                  </Link>
                  {isAdminPath && (
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => openDeleteModal(artist)}
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

      <AddArtistModal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        handleArtist={handleArtistAdded}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        item={selectedArtistToDelete}
        onClose={closeDeleteModal}
        onDeleted={handleArtistDeleted}
        endpoint="/admin/artists"
        entityName="artiste"
        getLabel={(a) => a.name}
      />
    </div>
  );
}
