import { FESTIVAL_LOCATION } from "../../config/festival";
import SectionCta from "../../components/SectionCta";

const INFOS = [
  "Parking gratuit sur place",
  "Restauration disponible",
  "Buvette tout au long de l'événement",
  "Cadre intimiste au cœur de la Charente",
];

/** Affiche la section infos pratiques de la page d'accueil — adresse, icônes et carte du lieu. */
export default function HomeInfosPratiques() {
  return (
    <section className="home-section">
      <h2 className="home-section-title">Infos Pratiques</h2>

      <div className="home-cards flex-1 my-8 items-stretch">
        <div className="home-card border-0 gap-0 items-start text-left md:max-w-[40%]">
          <div className="w-full h-1 bg-(--color-1) rounded-t-md" />
          <div className="flex flex-col gap-4 p-6">
            <div>
              <h3 className="text-xl font-black uppercase">
                {FESTIVAL_LOCATION.name}
              </h3>
              <p className="text-sm opacity-70 uppercase mt-1">
                {FESTIVAL_LOCATION.address}
              </p>
              <p className="text-sm opacity-70 uppercase">
                {FESTIVAL_LOCATION.city}
              </p>
            </div>
            <ul className="flex flex-col gap-3 text-sm">
              {INFOS.map((info) => (
                <li key={info} className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 shrink-0 text-(--color-1)"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{info}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="home-card overflow-hidden p-0 min-h-80 md:max-w-[60%]">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d5570.61407394697!2d0.120396!3d45.724937!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47fe2f2dc27ba211%3A0x778504b1bfd88bfe!2sSalle%20des%20Fins%20Bois!5e0!3m2!1sfr!2sfr!4v1777205427993!5m2!1sfr!2sfr"
            className="block w-full h-80 md:flex-1"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localisation du festival"
          />
        </div>
      </div>

      <SectionCta href="/practical-info" label="Savoir plus" />
    </section>
  );
}
