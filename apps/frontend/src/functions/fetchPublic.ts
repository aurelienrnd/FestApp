/** Effectue un fetch GET côté serveur vers l'API publique avec revalidation ISR (60s).
 * Retourne les données parsées, ou null si la réponse n'est pas ok.
 * @param {string} path Chemin de l'endpoint (ex : "/public/home").
 * @returns {Promise<T | null>} Les données parsées ou null en cas d'erreur.
 */
export async function fetchPublic<T>(path: string): Promise<T | null> {
  const apiUrl = process.env.API_URL_SERVER || process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${apiUrl}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      console.error(`fetchPublic ${path} — ${res.status}`);
      return null;
    }

    return res.json() as Promise<T>;
  } catch {
    console.error(`fetchPublic ${path} — erreur réseau`);
    return null;
  }
}
