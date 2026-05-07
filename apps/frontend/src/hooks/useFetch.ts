"use client";
import { useState, useEffect } from "react";
import { apiRequest } from "../functions/apiRequest";
import { getApiErrorMessage } from "../functions/getApiErrorMessage";

/** Charge des données depuis l'API au montage du composant.
 * @param {string} endpoint Chemin de l'endpoint (ex : "/public/lineup").
 * @returns { data: T | null, isLoading: boolean, error: string | null } - Les données chargées, l'état de chargement et l'erreur éventuelle.
 */
export function useFetch<T>(endpoint: string): {
  data: T | null;
  isLoading: boolean;
  error: string | null;
} {
  // initialisation de data, isLoading et error
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // A chaque changement d'endpoint
  useEffect(() => {
    // réinitialisation de isLoading et error
    setIsLoading(true);
    setError(null);

    // appel API et gestion de la réponse
    apiRequest<T>(endpoint).then((result) => {
      // en cas d'erreur, on met à jour error et isLoading, puis on arrête
      if (result.error) {
        setError(getApiErrorMessage(result.error));
        setIsLoading(false);
        return;
      }

      // en cas de succès, on met à jour data et isLoading
      setData(result.data);
      setIsLoading(false);
    });
  }, [endpoint]);

  // on retourne les données, l'état de chargement et l'erreur éventuelle
  return { data, isLoading, error };
}
