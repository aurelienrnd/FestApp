import Image from "next/image";
import type { HomeArtist } from "../../type";
import SectionCta from "../../components/SectionCta";
import { formatConcertDatetime } from "../../functions/formatDate";

/** Affiche la section programmation de la page d'accueil — 2 artistes les plus récents.
 * @param {HomeArtist[]} props.artists Liste des artistes à afficher.
 * @children SectionCta pour voir la page complète de la programmation.
 */
export default function HomeProgrammation({
  artists,
}: {
  artists: HomeArtist[];
}) {
  // Si la liste est vide, on n'affiche pas la section du tout.
  if (artists.length === 0) return null;

  return (
    <section className="home-section home-section-vh">
      <h2 className="home-section-title">Programmation</h2>

      <div className="home-cards">
        {artists.map((artist) => {
          const concert = artist.start_time
            ? formatConcertDatetime(artist.start_time)
            : null;

          return (
            <div key={artist.id} className="home-card">
              <div className="home-card-img">
                <Image
                  src={artist.url_media}
                  alt={artist.description_media}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 160px"
                />
              </div>
              <div className="home-card-content">
                <span className="font-black uppercase text-xl leading-tight">
                  {artist.name}
                </span>
                {concert && (
                  <span className="text-sm uppercase tracking-wide">
                    {concert.date}
                  </span>
                )}
                {concert && (
                  <span className="text-sm uppercase tracking-wide">
                    {concert.time}
                  </span>
                )}
                {artist.stage && (
                  <span className="text-sm uppercase tracking-wide">
                    {artist.stage}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <SectionCta href="/artists" label="Voir plus" />
    </section>
  );
}
