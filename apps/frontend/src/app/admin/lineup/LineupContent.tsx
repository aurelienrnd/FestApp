"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";

type ArtistListRow = {
  id: string;
  name: string;
  genre: string;
  origin: string;
  bio: string;
  url_media: string;
  description_media: string;
};

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
      const result = await apiRequest<ListArtistsResponse>("/admin/artists", {
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
          <ul className="flex flex-col gap-(--gap-content-small)">
            {artists.map((artist) => (
              <li
                key={artist.id}
                className="w-full rounded-md border border-(--color-text-input) p-(--spacing-around-small)
             flex flex-col gap-3"
              ></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
