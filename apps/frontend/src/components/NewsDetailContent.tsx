import Image from "next/image";
import type { NewsItem } from "../type";
import { formatDateLong } from "../functions/formatDate";

/** Affiche le contenu complet d'une news — image héro pleine largeur avec titre en overlay,
 * barre meta auteur/date, et corps de la news.
 * @param {NewsItem} props.news News à afficher.
 */
export default function NewsDetailContent({
  news,
}: {
  news: NewsItem;
}) {
  return (
    <div>
      <div className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden">
        <Image
          src={news.url_media}
          alt={news.description_media}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-(--color-bg-visitor) to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 md:px-16 md:pb-12">
          <h1 className="text-white font-black uppercase text-3xl md:text-5xl leading-tight max-w-4xl">
            {news.title}
          </h1>
        </div>
      </div>

      <div className="bg-(--color-1) px-6 py-3 md:px-16 flex flex-wrap items-center gap-3">
        <span className="text-white font-bold uppercase tracking-widest text-sm">
          {news.author_name ?? "Auteur inconnu"}
        </span>
        <span className="text-white/50">—</span>
        <span className="text-white/70 uppercase tracking-wide text-sm">
          {formatDateLong(news.created_at)}
        </span>
      </div>

      {news.content && (
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-10 md:py-16">
          <div className="leading-relaxed space-y-6 text-base md:text-lg">
            {news.content.split("\n").map((paragraph, i) =>
              paragraph.trim() ? <p key={i}>{paragraph}</p> : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}
