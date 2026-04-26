import Image from "next/image";

/** Liste statique des partenaires du festival.
 * Ajouter les logos dans `public/partners/` au format WebP.
 */
const PARTNERS_ROW_1 = [
  { name: "Capture-decran-2025-06-13-161300", logo: "/partners/partenaire-1.webp" },
  { name: "Charente Audition", logo: "/partners/partenaire-2.webp" },
  { name: "Colas", logo: "/partners/partenaire-3.webp" },
  { name: "HelloAsso", logo: "/partners/partenaire-4.webp" },
  { name: "Partenaire 5", logo: "/partners/partenaire-5.webp" },
  { name: "Partenaire 6", logo: "/partners/partenaire-6.webp" },
  { name: "Partenaire 7", logo: "/partners/partenaire-7.webp" },
  { name: "Partenaire 8", logo: "/partners/partenaire-8.webp" },
  { name: "Partenaire 9", logo: "/partners/partenaire-9.webp" },
  { name: "Partenaire 10", logo: "/partners/partenaire-10.webp" },
  { name: "Partenaire 11", logo: "/partners/partenaire-11.webp" },
  { name: "Partenaire 12", logo: "/partners/partenaire-12.webp" },
];

const PARTNERS_ROW_2 = [
  { name: "Partenaire 13", logo: "/partners/partenaire-13.webp" },
  { name: "Partenaire 14", logo: "/partners/partenaire-14.webp" },
  { name: "Partenaire 15", logo: "/partners/partenaire-15.webp" },
  { name: "Partenaire 16", logo: "/partners/partenaire-16.webp" },
  { name: "Partenaire 17", logo: "/partners/partenaire-17.webp" },
  { name: "Partenaire 18", logo: "/partners/partenaire-18.webp" },
  { name: "Partenaire 19", logo: "/partners/partenaire-19.webp" },
  { name: "Partenaire 20", logo: "/partners/partenaire-20.webp" },
  { name: "Logo Vindelle", logo: "/partners/partenaire-21.webp" },
  { name: "Nicolas Cloture", logo: "/partners/partenaire-22.webp" },
  { name: "SMIP", logo: "/partners/partenaire-23.webp" },
];

/** Affiche un logo partenaire.
 * @param {string} props.name Nom du partenaire.
 * @param {string} props.logo Chemin du logo.
 */
function PartnerLogo({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="relative h-16 w-28 flex-shrink-0">
      <Image src={logo} alt={name} fill className="object-contain" />
    </div>
  );
}

/** Affiche la section partenaires — deux rangées en défilement infini opposé. */
export default function HomePartenaires() {
  return (
    <section className="home-section">
      <h2 className="home-section-title">Partenaires</h2>

      <div className="overflow-hidden w-full flex flex-col gap-10 mt-8">
        <div className="flex w-max gap-6" style={{ animation: "marquee-left 60s linear infinite" }}>
          {[...PARTNERS_ROW_1, ...PARTNERS_ROW_1].map((partner, i) => (
            <PartnerLogo key={i} name={partner.name} logo={partner.logo} />
          ))}
        </div>
        <div className="flex w-max gap-6" style={{ animation: "marquee-right 80s linear infinite" }}>
          {[...PARTNERS_ROW_2, ...PARTNERS_ROW_2].map((partner, i) => (
            <PartnerLogo key={i} name={partner.name} logo={partner.logo} />
          ))}
        </div>
      </div>
    </section>
  );
}
