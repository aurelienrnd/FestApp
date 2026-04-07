import { FESTIVAL_LOCATION } from "../../config/festival";
import SectionCta from "../../components/SectionCta";

/** Affiche la section infos pratiques de la page d'accueil — adresse et présentation du lieu. */
export default function HomeInfosPratiques() {
  return (
    <section className="home-section">
      <h2 className="home-section-title">Infos Pratiques</h2>
      <div className="home-section-divider" />

      <p className="home-info-address">{FESTIVAL_LOCATION.name}</p>
      <p className="home-info-address">{FESTIVAL_LOCATION.address}</p>
      <p className="home-info-address">{FESTIVAL_LOCATION.city}</p>

      <p className="home-info-text">
        Situé au cœur de la Charente, le Vindhellfest prend place dans un cadre
        intimiste et convivial. Parking gratuit sur place, restauration et buvette
        disponibles tout au long de l&apos;événement.
      </p>

      <SectionCta href="/practical-info" label="Savoir plus" />
    </section>
  );
}
