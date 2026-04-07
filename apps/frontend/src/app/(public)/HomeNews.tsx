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
    <section className="home-section">
      <h2 className="home-section-title">News</h2>
      <div className="home-section-divider" />

      <div className="home-news-grid">
        {articles.map((article) => (
          <div key={article.id} className="home-news-card">
            <div className="home-news-img-wrapper">
              <Image
                src={article.url_media}
                alt={article.description_media}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="home-news-info">
              <span className="home-news-title">{article.title}</span>
            </div>
          </div>
        ))}
      </div>

      <SectionCta href="/news" label="Voir plus" />
    </section>
  );
}
