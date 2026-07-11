import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import type { NewsItem } from "../../../../type";
import NewsDetailContent from "../../../../components/NewsDetailContent";
import { fetchPublic } from "../../../../functions/fetchPublic";

/** Recupere la news par id, memoise avec React cache() pour n'effectuer qu'un seul
 * fetch reseau meme si generateMetadata et la page l'appellent tous les deux.
 */
const getNews = cache((id: string) =>
  fetchPublic<{ news: NewsItem }>(`/public/news/${id}`),
);

/** Genere les metadata (titre, description) a partir des donnees de la news.
 * @param {{ id: string }} props.params Paramètres de route dynamique.
 * @function getNews Recupere la news (memoise par requete).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getNews(id);

  // notFound() sera appelé par la page — Next.js ignore alors ce retour, inutile d'y définir un titre.
  if (!data) return {};

  const { title, description_media } = data.news;
  return {
    title: `${title} | Vindhellfest`,
    description: description_media,
  };
}

/** Page publique de détail d'une news — composant serveur.
 * Récupère la news via GET /public/news/:id et la passe à NewsDetailContent.
 * Redirige vers /news si la news n'existe pas ou n'est pas publiée.
 * @param {{ id: string }} props.params Paramètres de route dynamique.
 * @function getNews Recupere la news (memoise par requete).
 */
export default async function NewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // initialise la requête pour récupérer les données de l'artiste en fonction de l'id
  const { id } = await params;
  const data = await getNews(id);

  // si aucune donnée n'est retournée, redirige vers la page 404
  if (!data) notFound();

  return <NewsDetailContent news={data.news} />;
}
