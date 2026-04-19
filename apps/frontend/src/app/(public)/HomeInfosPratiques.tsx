import { FESTIVAL_LOCATION } from "../../config/festival";
import SectionCta from "../../components/SectionCta";

/** Affiche la section infos pratiques de la page d'accueil — adresse et présentation du lieu. */
export default function HomeInfosPratiques() {
  return (
    <section className="home-section">
      <h2 className="home-section-title">Infos Pratiques</h2>

      <div className="home-cards flex-1 my-8">
        <div className="home-card border-0 p-6 gap-3 items-center justify-center text-center">
          <p className="font-black uppercase">{FESTIVAL_LOCATION.name}</p>
          <p className="font-black uppercase">{FESTIVAL_LOCATION.address}</p>
          <p className="font-black uppercase">{FESTIVAL_LOCATION.city}</p>
          <p className="text-sm leading-relaxed">
            Situé au cœur de la Charente, le Vindhellfest prend place dans un cadre
            intimiste et convivial. Parking gratuit sur place, restauration et buvette
            disponibles tout au long de l&apos;événement.
          </p>
        </div>

        <div className="home-card" />
      </div>

      <SectionCta href="/practical-info" label="Savoir plus" />
    </section>
  );
}
