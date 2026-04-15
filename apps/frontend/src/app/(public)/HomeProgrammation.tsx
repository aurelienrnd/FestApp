import Image from "next/image";
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
    <section className="home-section home-section-full">
      <h2 className="home-section-title">Programmation</h2>

      <div className="h-full w-full home-grid">
        {artists.map((artist) => {
          // Convertit le timestamp ISO de la BDD en objet Date, ou null si absent
          const startDate = artist.start_time
            ? new Date(artist.start_time)
            : null;

          // Formate la date en "samedi 23 août" — null si pas de date
          const formattedDate = startDate
            ? startDate.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
            : null;

          // Formate l'heure en "20:00" — null si pas de date
          const formattedTime = startDate
            ? startDate.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : null;

          return (
            <div
              key={artist.id}
              className="flex flex-row md:flex-col overflow-hidden rounded-md border border-(--color-text-input) w-full h-full"
            >
              <div className="relative w-[50%] md:w-full h-full md:h-72 flex-shrink-0">
                <Image
                  src={artist.url_media}
                  alt={artist.description_media}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 160px"
                />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <span className="font-black uppercase text-xl leading-tight">
                  {artist.name}
                </span>
                {formattedDate && (
                  <span className="text-sm uppercase tracking-wide">
                    {formattedDate}
                  </span>
                )}
                {formattedTime && (
                  <span className="text-sm uppercase tracking-wide">
                    {formattedTime}
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

      <SectionCta href="/lineup" label="Voir plus" />
    </section>
  );
}
