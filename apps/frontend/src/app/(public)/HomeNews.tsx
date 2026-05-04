import Image from "next/image";
import type { HomeArticleRow } from "../../type";
import SectionCta from "../../components/SectionCta";

/** Affiche la section news de la page d'accueil — 2 derniers articles publiés.
 * @param {HomeArticleRow[]} props.articles Liste des articles à afficher.
 */
export default function HomeNews({ articles }: { articles: HomeArticleRow[] }) {
  // si aucun article n'est publié, on n'affiche pas la section
  if (articles.length === 0) return null;

  return (
    <section className="home-section home-section-vh">
      <h2 className="home-section-title">News</h2>

      <div className="home-cards">
        {articles.map((article) => (
          <div key={article.id} className="home-card">
            <div className="home-card-img">
              <Image
                src={article.url_media}
                alt={article.description_media}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 160px"
              />
            </div>
            <div className="home-card-content">
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
