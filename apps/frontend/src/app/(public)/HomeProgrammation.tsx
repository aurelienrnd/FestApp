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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
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
            <div key={artist.id} className="flex flex-row overflow-hidden rounded-md border border-(--color-text-input)">
              <div className="relative w-40 flex-shrink-0 self-stretch">
                <Image
                  src={artist.url_media}
                  alt={artist.description_media}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <span className="font-black uppercase text-xl leading-tight">{artist.name}</span>
                {formattedDate && (
                  <span className="text-sm uppercase tracking-wide">{formattedDate}</span>
                )}
                {formattedTime && (
                  <span className="text-sm uppercase tracking-wide">{formattedTime}</span>
                )}
                {artist.stage && (
                  <span className="text-sm uppercase tracking-wide">{artist.stage}</span>
                )}
                <Link href="/lineup" className="text-xs uppercase mt-auto self-end opacity-60 hover:opacity-100 transition-opacity">
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
