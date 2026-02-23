export class ApiRequestError extends Error {
  status: number;

  constructor(message: string | undefined, status: number) {
    super(message || "Erreur API");
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export type ApiRequestResult<T> =
  | { data: T; error: null }
  | { data: null; error: ApiRequestError };

export type ApiMessageResponse = {
  message?: string;
};

/** Envoie une requete API avec `fetch` en incluant les credentials.
 * Si la reponse HTTP est en erreur (`!response.ok`), remonte une `ApiRequestError`.
 * Retourne `{ data, error: null }` en succes, sinon `{ data: null, error }` en echec.
 * @param {string} path Chemin de l'endpoint API (ex: `/admin/auth/login`).
 * @param {RequestInit} [init] Options de requete `fetch` (method, headers, body, etc.).
 */
function extractApiErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object" || !("error" in data)) {
    return undefined;
  }

  const apiError = (data as { error?: unknown }).error;
  return typeof apiError === "string" ? apiError : undefined;
}

export async function apiRequest<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<ApiRequestResult<T>> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    // Execute la requete HTTP vers l'API
    const response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: "include",
      ...init,
    });

    const data = (await response.json().catch(() => null)) as T | null;

    // Si l'API repond avec une erreur HTTP, on remonte le message + status.
    if (!response.ok) {
      const message = extractApiErrorMessage(data);
      const status = response.status;
      throw new ApiRequestError(message, status);
    }

    return { data: data as T, error: null };
  } catch (error: unknown) {
    // Erreur API attendue: deja normalisee en amont.
    if (error instanceof ApiRequestError) {
      return { data: null, error };
    }

    // Erreur technique standard: reseau fetch, runtime, etc. -> on normalise.
    if (error instanceof Error) {
      return { data: null, error: new ApiRequestError(error.message, 500) };
    }

    // Cas limite: valeur non-Error levee.
    return { data: null, error: new ApiRequestError("Erreur inconnue", 500) };
  }
}
