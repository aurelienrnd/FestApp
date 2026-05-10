import Image from "next/image";
import type { HomeNews as HomeNewsItem } from "../../type";
import SectionCta from "../../components/SectionCta";

/** Affiche la section news de la page d'accueil — 2 dernières news publiées.
 * @param {HomeNewsItem[]} props.newsList Liste des news à afficher.
 */
export default function HomeNews({ newsList }: { newsList: HomeNewsItem[] }) {
  // si aucune news n'est publiée, on n'affiche pas la section
  if (newsList.length === 0) return null;

  return (
    <section className="home-section home-section-vh">
      <h2 className="home-section-title">News</h2>

      <div className="home-cards">
        {newsList.map((news) => (
          <div key={news.id} className="home-card">
            <div className="home-card-img">
              <Image
                src={news.url_media}
                alt={news.description_media}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 160px"
              />
            </div>
            <div className="home-card-content">
              <span className="font-black uppercase text-xl leading-tight">
                {news.title}
              </span>
            </div>
          </div>
        ))}
      </div>

      <SectionCta href="/news" label="Voir plus" />
    </section>
  );
}
