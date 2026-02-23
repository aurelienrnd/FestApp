import { ApiRequestError } from "./apiRequest";

/** Retourne un message utilisateur a partir d'une ApiRequestError.
 * Le message backend est prioritaire quand il est explicite.
 */
export function getApiErrorMessage(error: ApiRequestError): string {
  const apiMessage = error.message?.trim();

  if (apiMessage && apiMessage !== "Erreur API") {
    return apiMessage;
  }

  if (error.status === 401) {
    return "Session expiree, merci de vous reconnecter.";
  }

  if (error.status === 403) {
    return "Acces refuse.";
  }

  if (error.status === 404) {
    return "Ressource introuvable.";
  }

  if (error.status === 429) {
    return "Trop de tentatives, reessayez plus tard.";
  }

  if (error.status >= 500) {
    return "Erreur serveur, reessayez plus tard.";
  }

  return "Une erreur est survenue.";
}
