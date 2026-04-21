import Link from "next/link";

/** Affiche un séparateur avec un bouton CTA centré entre deux lignes horizontales.
 * @param {string} props.href Chemin de destination au clic.
 * @param {string} [props.label="Voir plus"] Texte du bouton.
 */
export default function SectionCta({
  href,
  label = "Voir plus",
}: {
  href: string;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-center gap-6 w-full mt-6 group/cta">
      <span
        className="flex-1 h-0.5 bg-(--color-3) group-has-[.btn-cta:hover]/cta:[animation:line-reload_1.4s_ease_forwards]"
        style={{ transformOrigin: "right" }}
      />
      <Link href={href} className="btn-cta uppercase">
        {label}
      </Link>
      <span
        className="flex-1 h-0.5 bg-(--color-3) group-has-[.btn-cta:hover]/cta:[animation:line-reload_1.4s_ease_forwards]"
        style={{ transformOrigin: "left" }}
      />
    </div>
  );
}
