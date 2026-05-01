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

/** Affiche le contenu complet d'un article — image de couverture, titre, auteur, date et corps du texte.
 * @param {ArticleRow} props.article Article à afficher.
 */
export default function ArticleDetailContent({
  article,
}: {
  article: ArticleRow;
}) {
  return (
    <article className="max-w-3xl mx-auto py-10 px-6 w-full">
      <div className="relative w-full h-72 md:h-96">
        <Image
          src={article.url_media}
          alt={article.description_media}
          fill
          sizes="(min-width: 768px) 896px, 100vw"
          className="object-cover"
          priority
        />
      </div>
      <div className="bg-(--color-1) px-6 py-4 ml-10 mt-4 mb-3">
        <h1 className="text-white font-black uppercase text-2xl md:text-4xl">
          {article.title}
        </h1>
        <p className="text-sm uppercase tracking-wide text-white/70 mt-1">
          {article.author_name ?? "Auteur inconnu"} —{" "}
          {formatDate(article.created_at)}
        </p>
      </div>
      {article.content && (
        <div className="leading-relaxed space-y-4 py-6 px-2">
          <p>{article.content}</p>
        </div>
      )}
    </article>
  );
}
