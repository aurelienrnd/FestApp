import { notFound } from "next/navigation";
import type { NewsItem } from "../../../../type";
import NewsDetailContent from "../../../../components/NewsDetailContent";
import { fetchPublic } from "../../../../functions/fetchPublic";

/** Page publique de détail d'une news — composant serveur.
 * Récupère la news via GET /public/news/:id et la passe à NewsDetailContent.
 * Redirige vers /news si la news n'existe pas ou n'est pas publiée.
 * @param {{ id: string }} props.params Paramètres de route dynamique.
 * @function fetchPublic Effectue un fetch GET côté serveur avec revalidation ISR.
 */
export default async function NewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await fetchPublic<{ news: NewsItem }>(`/public/news/${id}`);

  if (!data) notFound();

  return <NewsDetailContent news={data.news} />;
}
