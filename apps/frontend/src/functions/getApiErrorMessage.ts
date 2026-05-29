import { ApiRequestError } from "./apiRequest";

/** Définit un message à retourner à l'utilisateur selon le statut de l'erreur si celle-ci ne possède pas déjà de message explicite
 * @param error L'erreur de requête API à analyser
 * @returns Un message d'erreur adapté à afficher à l'utilisateur
 */
export function getApiErrorMessage(error: ApiRequestError): string {
  // Vérifie ci le message possaide un message explicite
  const apiMessage = error.message?.trim();
  if (apiMessage && apiMessage !== "Erreur API") {
    return apiMessage;
  }

  // Ajuste le message selon le statut d'erreur HTTP.
  switch (error.status) {
    case 401:
      return "Session expiree, merci de vous reconnecter.";
    case 403:
      return "Acces refuse.";
    case 404:
      return "Ressource introuvable.";
    case 429:
      return "Trop de tentatives, reessayez plus tard.";
    default:
      if (error.status >= 500) {
        return "Erreur serveur, reessayez plus tard.";
      }
      return "Une erreur est survenue.";
  }
}
