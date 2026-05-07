"use client";
import { useState } from "react";
import { apiRequest } from "../functions/apiRequest";
import { getApiErrorMessage } from "../functions/getApiErrorMessage";

/** Gère l'état d'une suppression via l'API.
 * @param {string} endpoint Chemin de base de l'endpoint (ex : "/admin/artists").
 * @return {Object} Un objet contenant :
 * - handleDelete : fonction pour supprimer un élément par son id, appelle onSuccess en cas de succès.
 * - isSubmitting : booléen indiquant si la requête est en cours.
 * - isDeleted : booléen passant à true après une suppression réussie.
 * - error : message d'erreur en cas d'échec, ou null.
 */
export function useDelete(endpoint: string): {
  handleDelete: (id: string, onSuccess: (id: string) => void) => Promise<void>;
  isSubmitting: boolean;
  isDeleted: boolean;
  error: string | null;
} {
  // initialisation de isSubmitting, is isDeleted et error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Envoie la requête DELETE pour supprimer un élément et gère les états de chargement et d'erreur.
   * @param {string} id Identifiant de l'élément à supprimer.
   * @param {(id: string) => void} onSuccess Callback appelé avec l'id en cas de succès.
   */
  const handleDelete = async (id: string, onSuccess: (id: string) => void) => {
    // Initialisation de la requête
    setIsSubmitting(true);
    setError(null);

    // Envoi de la requête DELETE et récupération du résultat
    const result = await apiRequest(`${endpoint}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    // En cas d'erreur, on traduit le code d'erreur en message lisible et on arrête
    if (result.error) {
      setError(getApiErrorMessage(result.error));
      setIsSubmitting(false);
      return;
    }

    // Succès : on notifie le parent et on marque l'élément comme supprimé
    onSuccess(id);
    setIsDeleted(true);
    setIsSubmitting(false);
  };

  return { handleDelete, isSubmitting, isDeleted, error };
}
