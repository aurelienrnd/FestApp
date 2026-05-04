import { notFound } from "next/navigation";
import type { ArticleRow } from "../../../../type";
import ArticleDetailContent from "../../../admin/news/ArticleDetailContent";

/** Page publique de détail d'un article — composant serveur.
 * Récupère l'article via GET /public/news/:id et le passe à ArticleDetailContent.
 * Redirige vers /news si l'article n'existe pas ou n'est pas publié.
 * @param {{ id: string }} props.params Paramètres de route dynamique.
 */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apiUrl = process.env.API_URL_SERVER || process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${apiUrl}/public/news/${id}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) notFound();

  const { article }: { article: ArticleRow } = await res.json();

  return <ArticleDetailContent article={article} />;
}
