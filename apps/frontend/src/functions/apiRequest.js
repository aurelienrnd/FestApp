/** Envoie une requête API avec `fetch` en incluant les credentials.
 * Si la réponse HTTP est en erreur (`!response.ok`), remonte un objet `{ message, status }`.
 * Retourne `{ data, error: null }` en succès, sinon `{ data: null, error }` en échec.
 * @param {string} path : Chemin de l’endpoint API (ex: `/admin/auth/login`).
 * @param {RequestInit} [init] : Options de requête `fetch` (method, headers, body, etc.).
 */
export async function apiRequest(path, init = {}) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    // Exécute la requête HTTP vers l’API
    const response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: "include",
      ...init,
    });

    const data = await response.json().catch(() => null);

    // Si l’API répond avec uune erreur HTTP, on remonte le message + status autrement on retourne les données sans erreur.
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

