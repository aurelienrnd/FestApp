"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiRequest } from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";
import AddArtistModal from "./AddArtistModal";
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

  // Ajoute l'artiste cree a la liste locale puis ferme la modale
  const handleArtistAdded = (artist: ArtistListRow) => {
    setArtists((current) => [...current, artist]);
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
                <div className="card-lineup-media">
                  <Image
                    src={artist.url_media}
                    alt={artist.description_media}
                    width={192}
                    height={128}
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
    </div>
  );
}
