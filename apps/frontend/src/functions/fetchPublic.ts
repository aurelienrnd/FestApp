/** Effectue un fetch GET côté serveur vers l'API publique avec revalidation ISR (60s).
 * Retourne les données parsées, ou null si la réponse n'est pas ok.
 * @param {string} path Chemin de l'endpoint (ex : "/public/home").
 */
export async function fetchPublic<T>(path: string): Promise<T | null> {
  const apiUrl = process.env.API_URL_SERVER || process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${apiUrl}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}
