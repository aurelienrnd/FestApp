/** Envoie une requete API avec `fetch` en incluant les credentials.
 * Si la reponse HTTP est en erreur (`!response.ok`), remonte un objet `{ message, status }`.
 * Retourne `{ data, error: null }` en succes, sinon `{ data: null, error }` en echec.
 * @param {string} path Chemin de l'endpoint API (ex: `/admin/auth/login`).
 * @param {RequestInit} [init] Options de requete `fetch` (method, headers, body, etc.).
 */
export async function apiRequest(path, init = {}) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    // Execute la requete HTTP vers l'API
    const response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: "include",
      ...init,
    });

    const data = await response.json().catch(() => null);

    // Si l'API repond avec une erreur HTTP, on remonte le message + status.
    if (!response.ok) {
      const message = data?.error;
      const status = response.status;
      throw { message, status };
    }

    return { data, error: null };
  } catch (error) {
    const err = error;
    console.log(err?.message, err?.status);
    return { data: null, error: err };
  }
}
