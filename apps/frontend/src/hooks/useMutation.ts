"use client";
import { useState } from "react";
import { apiRequest } from "../functions/apiRequest";
import { getApiErrorMessage } from "../functions/getApiErrorMessage";

/** Gère l'état d'un appel API de création ou de modification.
 * @param {string} endpoint Chemin de l'endpoint (ex : "/admin/artists").
 * @param {'POST' | 'PATCH'} method Méthode HTTP à utiliser.
 * @return {Object} Un objet contenant :
 * - mutate: une fonction pour effectuer la mutation, prenant en paramètre le corps de la requête et une fonction de callback à appeler en cas de succès.
 * - isLoading: un booléen indiquant si la requête est en cours.
 * - error: un message d'erreur en cas d'échec de la requête, ou null si aucune erreur.
 * - reset: une fonction pour réinitialiser l'état de chargement et d'erreur (utile à la fermeture d'une modale).
 */
export function useMutation<T>(
  endpoint: string,
  method: "POST" | "PATCH",
): {
  mutate: (
    body: FormData | Record<string, unknown>,
    onSuccess: (data: T) => void,
  ) => Promise<void>;

  isLoading: boolean;
  error: string | null;
  reset: () => void;
} {
  // initialisation de isLoading et error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Fonction pour effectuer la mutation
   * @param {FormData | Record<string, unknown>} body Corps de la requête.
   * @param {(data: T) => void} onSuccess Callback appelé avec les données en cas de succès.
   */
  const mutate = async (
    body: FormData | Record<string, unknown>,
    onSuccess: (data: T) => void,
  ) => {
    // réinitialisation de isLoading et error
    setIsLoading(true);
    setError(null);

    // préparation de la requête en fonction du type de body
    const init: RequestInit =
      // Si le body est un FormData, on l'envoie tel quel autrement on stringify le body et on ajoute l'en-tête Content-Type
      body instanceof FormData
        ? { method, body }
        : {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          };

    // Envoi de la requête et récupération du résultat typé
    const result = await apiRequest<T>(endpoint, init);

    // En cas d'erreur, on traduit le code d'erreur en message lisible et on arrête
    if (result.error) {
      setError(getApiErrorMessage(result.error));
      setIsLoading(false);
      return;
    }

    // Succès : on notifie le parent avec les données reçues
    onSuccess(result.data);
    setIsLoading(false);
  };

  // // Remet isLoading et error à leur valeur initiale — à appeler à la fermeture d'une modale
  const reset = () => {
    setIsLoading(false);
    setError(null);
  };

  return { mutate, isLoading, error, reset };
}
