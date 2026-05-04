import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faYoutube, faSpotify } from "@fortawesome/free-brands-svg-icons";
import type { ArtistListRow } from "../../../types";

/** Formate une date ISO en "JOUR JJ MOIS HHhMM" en francais majuscule.
 * @param {string} isoString Date ISO 8601
 */
function formatConcertDateTime(isoString: string): string {
  const date = new Date(isoString);
  const weekday = date.toLocaleDateString("fr-FR", { weekday: "long" });
  const day = date.toLocaleDateString("fr-FR", { day: "numeric" });
  const month = date.toLocaleDateString("fr-FR", { month: "long" });
  const time = date
    .toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    .replace(":", "H");
  return `${weekday} ${day} ${month} ${time}`.toUpperCase();
}

/** Affiche le detail complet d'un artiste : image hero, nom, biographie, infos concert et liens sociaux.
 * @param {ArtistListRow} props.artist Artiste a afficher.
 * @function formatConcertDateTime Formate une date ISO en "JOUR JJ MOIS HHhMM" en francais majuscule.
 */
export default function ArtistDetailContent({
  artist,
}: {
  artist: ArtistListRow;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="detail-layout">
        <div className="detail-img-wrapper">
          <Image
            src={artist.url_media}
            alt={artist.description_media}
            fill
            sizes="(min-width: 1024px) 672px, 100vw"
            className="object-cover"
            priority
          />
        </div>

        <div className="detail-name-block">
          <h1 className="detail-name">{artist.name}</h1>
        </div>

        <div className="detail-bio">
          <p>{artist.bio}</p>
        </div>

        <div className="detail-date-block">
          {artist.start_time
            ? formatConcertDateTime(artist.start_time)
            : "Date non definie"}
        </div>

        <div className="detail-socials">
          {artist.youtube_url && (
            <a
              href={artist.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FontAwesomeIcon
                icon={faYoutube}
                className="text-(--color-2)"
              />
            </a>
          )}
          {artist.spotify_url && (
            <a
              href={artist.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Spotify"
            >
              <FontAwesomeIcon
                icon={faSpotify}
                className="text-(--color-2)"
              />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
