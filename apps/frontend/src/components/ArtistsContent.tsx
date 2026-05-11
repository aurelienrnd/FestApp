"use client";

import { useEffect, useMemo, useState } from "react";
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
 * @function useFetch Recupere les artistes depuis l'API et gere les etats loading/error
 * @param {boolean} props.isAddModalOpen Ouvre la modale d'ajout artiste.
 * @param {() => void} props.onCloseAddModal Ferme la modale d'ajout artiste.
 * @param {string | null} props.activeFilter utilisee pour filtrer les artistes par jour — null affiche tous les artistes.
 * @children AddArtistModal - Affiche la modale d'ajout d'artiste.
 * @function handleArtistAdded Ajoute l'artiste cree a la liste locale et ferme la modale.
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
  // Verifie si le chemin d'acces contient "/admin" pour afficher les boutons de suppression
  const { isAdminPath } = useNavPath();
  const basePath = isAdminPath ? "/admin/artists" : "/artists";

  const { data, isLoading, error } = useFetch<{ artists: ArtistSummary[] }>(
    "/public/artists",
  );

  // Liste mutable pour les ajouts et suppressions locaux
  const [artistList, setArtistList] = useState<ArtistSummary[]>([]);
  useEffect(() => {
    setArtistList(data?.artists ?? []);
  }, [data]);

  const {
    isOpen: isDeleteModalOpen,
    item: selectedArtistToDelete,
    open: openDeleteModal,
    close: closeDeleteModal,
  } = useModal<ArtistSummary>();

  // Supprime l'artiste  de la liste après confirmation de suppression
  const handleArtistDeleted = (artistId: string) => {
    setArtistList((current) =>
      current.filter((artist) => artist.id !== artistId),
    );
  };

  // Ajoute l'artiste cree a la liste locale puis ferme la modale
  const handleArtistAdded = (artist: ArtistItem) => {
    setArtistList((current) => [...current, artist]);
    onCloseAddModal();
  };

  // Convertit un timestamp ISO en minutes depuis minuit (heure seule), -1 si absent
  const toMinutes = (iso: string | null | undefined) => {
    if (!iso) return -1;
    const d = new Date(iso);
    return d.getHours() * 60 + d.getMinutes();
  };

  // Filtre par date selectionnee puis trie par heure decroissante (plus tardif en haut)
  // Memoïse pour eviter de recalculer lors des re-renders sans rapport (ouverture modale, etc.)
  const filteredArtists = useMemo(
    () =>
      (activeFilter
        ? artistList.filter((a) => a.start_time?.startsWith(activeFilter))
        : artistList
      ).sort((a, b) => toMinutes(b.start_time) - toMinutes(a.start_time)),
    [artistList, activeFilter],
  );

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
