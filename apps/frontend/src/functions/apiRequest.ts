/** Envoie une requete API avec `fetch` en incluant les credentials.
 * Si la reponse HTTP est en erreur (`!response.ok`), remonte une `ApiRequestError`.
 * Retourne `{ data, error: null }` en succes, sinon `{ data: null, error }` en echec.
 * @param {string} path Chemin de l'endpoint API (ex: `/admin/auth/login`).
 * @param {RequestInit} [init] Options de requete `fetch` (method, headers, body, etc.).
 */
class ApiRequestError extends Error {
  status: number;

  constructor(message: string | undefined, status: number) {
    super(message || "Erreur API");
    this.name = "ApiRequestError";
    this.status = status;
  }
}

function extractApiErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object" || !("error" in data)) {
    return undefined;
  }

  const apiError = (data as { error?: unknown }).error;
  return typeof apiError === "string" ? apiError : undefined;
}

export async function apiRequest(path: string, init: RequestInit = {}) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    // Execute la requete HTTP vers l'API
    const response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: "include",
      ...init,
    });

    const data: unknown = await response.json().catch(() => null);

    // Si l'API repond avec une erreur HTTP, on remonte le message + status.
    if (!response.ok) {
      const message = extractApiErrorMessage(data);
      const status = response.status;
      throw new ApiRequestError(message, status);
    }

    return { data, error: null };
  } catch (error: unknown) {
    // Erreur API attendue: levee quand la reponse HTTP est !ok (message + status).
    if (error instanceof ApiRequestError) {
      console.log(error.message, error.status);
      return { data: null, error };
    }

    // Erreur technique standard: reseau fetch, erreur runtime, etc.
    if (error instanceof Error) {
      console.log(error.message);
      return { data: null, error };
    }

    // Cas limite: valeur levee qui n'est pas une instance de Error.
    console.log("Erreur inconnue");
    return { data: null, error };
  }
}
