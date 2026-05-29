"use client";
import { useReducer, useEffect } from "react";
import { apiRequest } from "../functions/apiRequest";
import { getApiErrorMessage } from "../functions/getApiErrorMessage";

type FetchState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};
type FetchAction<T> =
  | { type: "LOADING" }
  | { type: "SUCCESS"; data: T }
  | { type: "ERROR"; error: string };

/** Charge des données depuis l'API au montage du composant.
 * @param {string} endpoint Chemin de l'endpoint (ex : "/public/artists").
 * @function apiRequest Fonction qui effectue la requête API et retourne une promesse avec les données ou l'erreur.
 * @function getApiErrorMessage Fonction qui récupère le message d'erreur partir de l'erreur retournée par apiRequest.
 * @returns { data: T | null, isLoading: boolean, error: string | null } - Les données chargées, l'état de chargement et l'erreur éventuelle.
 */
export function useFetch<T>(endpoint: string): {
  data: T | null;
  isLoading: boolean;
  error: string | null;
} {
  // On utilise useReducer pour gérer les états de chargement, succès et erreur de manière claire et prévisible.
  const [state, dispatch] = useReducer(
    (s: FetchState<T>, action: FetchAction<T>): FetchState<T> => {
      switch (action.type) {
        case "LOADING":
          return { ...s, isLoading: true, error: null };
        case "SUCCESS":
          return { data: action.data, isLoading: false, error: null };
        case "ERROR":
          return { ...s, isLoading: false, error: action.error };
      }
    },
    { data: null, isLoading: true, error: null },
  );

  // useEffect est utilisé pour déclencher la requête API au montage du composant et à chaque changement de l'endpoint.
  useEffect(() => {
    dispatch({ type: "LOADING" });

    // Effectue la requête API et retourne une promesse avec les données ou l'erreur.
    apiRequest<T>(endpoint).then((result) => {
      if (result.error) {
        dispatch({ type: "ERROR", error: getApiErrorMessage(result.error) });
        return;
      }

      dispatch({ type: "SUCCESS", data: result.data as T });
    });
  }, [endpoint]);

  return state;
}
