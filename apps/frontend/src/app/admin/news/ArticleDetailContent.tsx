import Image from "next/image";
import type { ArticleRow } from "../../../types";

/** Formate une date ISO en "JJ MOIS AAAA" en français.
 * @param {string} isoString Date ISO 8601
 */
function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Affiche le contenu complet d'un article — image héro pleine largeur avec titre en overlay,
 * barre meta auteur/date, et corps de l'article.
 * @param {ArticleRow} props.article Article à afficher.
 */
export default function ArticleDetailContent({
  article,
}: {
  article: ArticleRow;
}) {
  return (
    <div>
      <div className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden">
        <Image
          src={article.url_media}
          alt={article.description_media}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-(--color-bg-visitor) to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 md:px-16 md:pb-12">
          <h1 className="text-white font-black uppercase text-3xl md:text-5xl leading-tight max-w-4xl">
            {article.title}
          </h1>
        </div>
      </div>

      <div className="bg-(--color-1) px-6 py-3 md:px-16 flex flex-wrap items-center gap-3">
        <span className="text-white font-bold uppercase tracking-widest text-sm">
          {article.author_name ?? "Auteur inconnu"}
        </span>
        <span className="text-white/50">—</span>
        <span className="text-white/70 uppercase tracking-wide text-sm">
          {formatDate(article.created_at)}
        </span>
      </div>

      {article.content && (
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-10 md:py-16">
          <div className="leading-relaxed space-y-6 text-base md:text-lg">
            {article.content.split("\n").map((paragraph, i) =>
              paragraph.trim() ? <p key={i}>{paragraph}</p> : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}
