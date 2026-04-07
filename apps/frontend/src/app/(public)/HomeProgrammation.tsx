import Image from "next/image";
import Link from "next/link";
import type { HomeArtistRow } from "../../types";
import SectionCta from "../../components/SectionCta";

/** Affiche la section programmation de la page d'accueil — 2 artistes les plus récents.
 * @param {HomeArtistRow[]} props.artists Liste des artistes à afficher.
 */
export default function HomeProgrammation({
  artists,
}: {
  artists: HomeArtistRow[];
}) {
  // Si la liste est vide, on n'affiche pas la section du tout.
  if (artists.length === 0) return null;

  return (
    <section className="home-section">
      <h2 className="home-section-title">Programmation</h2>
      <div className="home-section-divider" />

      <div className="home-artist-grid">
        {artists.map((artist) => {
          const startDate = artist.start_time
            ? new Date(artist.start_time)
            : null;
          const formattedDate = startDate
            ? startDate.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
            : null;
          const formattedTime = startDate
            ? startDate.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : null;

          return (
            <div key={artist.id} className="home-artist-card">
              <div className="home-artist-img-wrapper">
                <Image
                  src={artist.url_media}
                  alt={artist.description_media}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
              <div className="home-artist-info">
                <span className="home-artist-name">{artist.name}</span>
                {formattedDate && (
                  <span className="home-artist-meta">{formattedDate}</span>
                )}
                {formattedTime && (
                  <span className="home-artist-meta">{formattedTime}</span>
                )}
                {artist.stage && (
                  <span className="home-artist-meta">{artist.stage}</span>
                )}
                <Link href="/lineup" className="home-artist-link">
                  VOIR PLUS
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <SectionCta href="/lineup" label="Voir plus" />
    </section>
  );
}
