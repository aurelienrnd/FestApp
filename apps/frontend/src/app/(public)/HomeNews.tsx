import Image from "next/image";
import type { HomeArticleRow } from "../../types";
import SectionCta from "../../components/SectionCta";

/** Affiche la section news de la page d'accueil — 2 derniers articles publiés.
 * @param {HomeArticleRow[]} props.articles Liste des articles à afficher.
 */
export default function HomeNews({ articles }: { articles: HomeArticleRow[] }) {
  // si aucun article n'est publié, on n'affiche pas la section
  if (articles.length === 0) return null;

  return (
    <section className="home-section home-section-full">
      <h2 className="home-section-title">News</h2>

      <div className="home-grid">
        {articles.map((article) => (
          <div key={article.id} className="flex flex-col overflow-hidden rounded-md border border-(--color-text-input)">
            <div className="relative h-40 w-full">
              <Image
                src={article.url_media}
                alt={article.description_media}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col gap-2 p-6">
              <span className="font-black uppercase text-sm leading-tight">{article.title}</span>
            </div>
          </div>
        ))}
      </div>

      <SectionCta href="/news" label="Voir plus" />
    </section>
  );
}
