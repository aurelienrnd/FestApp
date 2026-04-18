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

      <div className="home-cards">
        {articles.map((article) => (
          <div
            key={article.id}
            className="home-cards-item flex flex-col overflow-hidden rounded-md border border-(--color-text-input) h-full"
          >
            <div className="relative w-full h-40 md:h-72 flex-shrink-0">
              <Image
                src={article.url_media}
                alt={article.description_media}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 160px"
              />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="font-black uppercase text-xl leading-tight">
                {article.title}
              </span>
            </div>
          </div>
        ))}
      </div>

      <SectionCta href="/news" label="Voir plus" />
    </section>
  );
}
