import { notFound } from "next/navigation";
import type { ArticleItem } from "../../../../type";
import ArticleDetailContent from "../../../admin/news/ArticleDetailContent";
import { fetchPublic } from "../../../../functions/fetchPublic";

/** Page publique de détail d'un article — composant serveur.
 * Récupère l'article via GET /public/news/:id et le passe à ArticleDetailContent.
 * Redirige vers /news si l'article n'existe pas ou n'est pas publié.
 * @param {{ id: string }} props.params Paramètres de route dynamique.
 * @function fetchPublic Effectue un fetch GET côté serveur avec revalidation ISR.
 */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await fetchPublic<{ article: ArticleItem }>(`/public/news/${id}`);

  if (!data) notFound();

  return <ArticleDetailContent article={data.article} />;
}
