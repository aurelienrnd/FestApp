"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";
import type { ArtistListRow } from "../../../types";

type ListArtistsResponse = { artists: ArtistListRow[] };

/** Affiche la liste des artistes.
 * Recupere les artistes via l'API puis affiche un etat de chargement/erreur.
 * @function apiRequest Envoie une requete HTTP a l'API avec `fetch`
 * @function getApiErrorMessage Definit un message a retourner selon le statut de l'erreur
 */
export default function LineupContent() {
  // Etats lies aux donnees
  const [artists, setArtists] = useState<ArtistListRow[]>([]);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charge la liste des artistes au montage du composant
  useEffect(() => {
    const getArtists = async () => {
      // Active le chargement et reinitialise les erreurs
      setIsLoading(true);
      setLoadErrorMessage(null);

      // Appel API pour recuperer la liste des artistes
      const result = await apiRequest<ListArtistsResponse>("/public/lineup", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      // Gestion des erreurs API
      if (result.error) {
        setLoadErrorMessage(getApiErrorMessage(result.error));
        setIsLoading(false);
        return;
      }

      // Mise a jour de la liste des artistes
      setArtists(result.data?.artists ?? []);
      setIsLoading(false);
    };

    getArtists();
  }, []);

  return (
    <div className="flex-1 flex justify-center">
      <div className="w-full max-w-5xl">
        {isLoading ? (
          <p className="text-center">Chargement...</p>
        ) : loadErrorMessage ? (
          <p className="text-center text-(--color-1)">{loadErrorMessage}</p>
        ) : artists.length === 0 ? (
          <div className="flex h-full justify-center items-center">
            <p>Aucun artiste.</p>
          </div>
        ) : (
          <ul className="flex w-full flex-col items-center gap-(--space-md)">
            {artists.map((artist) => (
              <li key={artist.id} className="card-row">
                <div className="card-lineup-media">
                  <img
                    src={artist.url_media}
                    alt={artist.description_media}
                    className="card-media-img"
                  />
                </div>

                <div className="card-lineup-content">
                  <span>{artist.name}</span>
                  <span>Scene principale</span>
                  <span>Samedi 23 mai</span>
                  <span>22h30</span>
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
    </div>
  );
}
