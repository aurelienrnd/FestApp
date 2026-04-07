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
    <div className="home-section-link home-cta-row">
      <span className="home-section-link-line" />
      <Link href={href} className="btn-cta uppercase">
        {label}
      </Link>
      <span className="home-section-link-line" />
    </div>
  );
}
