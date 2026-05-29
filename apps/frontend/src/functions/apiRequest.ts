/** Erreur applicative personnalisee pour transporter un message et un code HTTP.
 * AppError herite de `Error` (`extends Error`) et permet d'etendre les proprietes
 * de la classe native (message, stack, name) avec `status`.
 */
export class ApiRequestError extends Error {
  status: number;

  constructor(message: string | undefined, status: number) {
    super(message || "Erreur API"); // initialise la partie native `Error` avec le message.
    this.name = "ApiRequestError"; // remplace le nom par defaut pour faciliter le debug.
    this.status = status; // assigne le code HTTP
  }
}

// Typage
export type ApiRequestResult<T> =
  | { data: T; error: null }
  | { data: null; error: ApiRequestError };

/** Récupère le message d'erreur renvoyé par l'API.
 * Vérifie que la valeur retournée est un objet contenant une propriété `error`.
 * Retourne la chaîne si `error` est de type `string`, sinon `undefined`.
 * @param {unknown} data Données JSON de la réponse API.
 * @returns {string | undefined} Message d'erreur ou `undefined` si non disponible.
 */
function extractApiErrorMessage(data: unknown): string | undefined {
  // Retourne `undefined` si la valeur retourné est absente, n'est pas un objet, ou ne contient pas la cle `error`.
  if (!data || typeof data !== "object" || !("error" in data)) {
    return undefined;
  }

  // Recupere la valeur du champ `error` dans `data`.
  const apiError = (data as { error?: unknown }).error;

  // Retourne le message d'erreur seulement si `apiError` est une chaine, sinon `undefined`.
  return typeof apiError === "string" ? apiError : undefined;
}

/** Envoie une requete HTTP a l'API avec `fetch` en incluant les cookies (`credentials: "include"`).
 * Tente de parser la reponse en JSON et retourne un resultat type `ApiRequestResult<T>`.
 * Si `response.ok` est false, creer une erreur ApiRequestError avec le message et le status
 * @param {string} path Chemin de l'endpoint API (ex: `/admin/auth/login`).
 * @param {RequestInit} [init={}] Options `fetch` (method, headers, body, etc.).
 * @function extractApiErrorMessage Récupère le message d'erreur renvoyé par l'API.
 * @returns {Promise<ApiRequestResult<T>>} `{ data, error: null }` en succes, sinon `{ data: null, error }`.
 */
export async function apiRequest<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<ApiRequestResult<T>> {
  // URL de base de l'API lue depuis la variable d'environnement publique Next.js.
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    // Execute la requete HTTP vers l'API
    const response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: "include",
      ...init,
    });

    // reception de la reponse de l'API, tentative de parsing en JSON. Si le parsing echoue, on retourne `null`.
    const data = (await response.json().catch(() => null)) as T | null;

    // Si l'API repond avec une erreur HTTP, on crée une ApiRequestError.
    if (!response.ok) {
      const message = extractApiErrorMessage(data);
      const status = response.status;
      throw new ApiRequestError(message, status);
    }

    // Retourne les donnees et indique qu'il n'y a pas d'erreur.
    return { data: data as T, error: null };
  } catch (error: unknown) {
    // Erreur API attendue.
    if (error instanceof ApiRequestError) {
      return { data: null, error };
    }

    // Erreur technique standard: exemple port fermé.
    if (error instanceof Error) {
      return { data: null, error: new ApiRequestError(error.message, 500) };
    }

    // Cas limite: valeur non-Error levee exemple timeout.
    return { data: null, error: new ApiRequestError("Erreur inconnue", 500) };
  }
}
