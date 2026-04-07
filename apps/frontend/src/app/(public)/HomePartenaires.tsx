import Image from "next/image";
import SectionCta from "../../components/SectionCta";

/** Liste statique des partenaires du festival.
 * Ajouter les logos dans `public/partners/` au format WebP.
 */
const PARTNERS = [
  { name: "Partenaire 1", logo: "/partners/partenaire-1.webp" },
  { name: "Partenaire 2", logo: "/partners/partenaire-2.webp" },
  { name: "Partenaire 3", logo: "/partners/partenaire-3.webp" },
  { name: "Partenaire 4", logo: "/partners/partenaire-4.webp" },
  { name: "Partenaire 5", logo: "/partners/partenaire-5.webp" },
];

/** Affiche la section partenaires de la page d'accueil — grille de logos statiques. */
export default function HomePartenaires() {
  return (
    <section className="home-section">
      <h2 className="home-section-title">Partenaires</h2>
      <div className="home-section-divider" />

      <div className="home-partners-grid">
        {PARTNERS.map((partner) => (
          <div key={partner.name} className="home-partner-logo">
            <Image
              src={partner.logo}
              alt={partner.name}
              width={80}
              height={40}
              className="object-contain"
            />
          </div>
        ))}
      </div>

      <SectionCta href="/practical-info" label="Voir plus" />
    </section>
  );
}
