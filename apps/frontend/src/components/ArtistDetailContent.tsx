import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faYoutube, faSpotify } from "@fortawesome/free-brands-svg-icons";
import type { ArtistItem } from "../type";

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

/** Affiche le detail complet d'un artiste : image hero pleine largeur avec nom en overlay,
 * barre de date, biographie et liens sociaux.
 * @param {ArtistItem} props.artist Artiste a afficher.
 * @param {string} props.backPath Chemin du lien retour (defaut : "/artists").
 */
export default function ArtistDetailContent({
  artist,
  backPath = "/artists",
}: {
  artist: ArtistItem;
  backPath?: string;
}) {
  return (
    <div>
      <div className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden">
        <Image
          src={artist.url_media}
          alt={artist.description_media}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-(--color-bg-visitor) to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 md:px-16 md:pb-12">
          <h1 className="text-white font-black uppercase text-3xl md:text-5xl leading-tight">
            {artist.name}
          </h1>
        </div>
      </div>

      <div className="bg-(--color-1) px-6 py-3 md:px-16 flex items-center">
        <span className="text-white font-bold uppercase tracking-widest text-sm">
          {artist.start_time
            ? formatConcertDateTime(artist.start_time)
            : "Date non définie"}
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-10 py-10 md:py-16">
        <Link
          href={backPath}
          className="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-bold text-(--color-text)/60 transition-colors hover:text-(--color-text) mb-10"
        >
          ← Retour
        </Link>

        {artist.bio && (
          <p className="leading-relaxed text-base md:text-lg">{artist.bio}</p>
        )}

        {(artist.youtube_url || artist.spotify_url) && (
          <div className="flex gap-6 mt-8 text-2xl">
            {artist.youtube_url && (
              <a
                href={artist.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-(--color-text)/60 transition-colors hover:text-(--color-text)"
              >
                <FontAwesomeIcon icon={faYoutube} />
              </a>
            )}
            {artist.spotify_url && (
              <a
                href={artist.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Spotify"
                className="text-(--color-text)/60 transition-colors hover:text-(--color-text)"
              >
                <FontAwesomeIcon icon={faSpotify} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
