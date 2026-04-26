import { FESTIVAL_LOCATION } from "../../../config/festival";

const ACCES_INFOS = [
  "Parking gratuit sur place",
  "Navettes spéciales depuis le centre-ville les deux jours du festival",
  "Covoiturage fortement encouragé",
  "Accessible en transports en commun depuis Angoulême",
];

const RESTAURATION_INFOS = [
  "Restauration disponible sur place tout au long de l'événement",
  "Buvette ouverte du début à la fin du festival",
  "Stands variés : burgers, grillades, plats chauds",
  "Options végétariennes disponibles",
];

const SUR_PLACE_INFOS = [
  "Cadre intimiste au cœur de la Charente",
  "Espace convivial, adapté aux familles",
  "Point de premiers secours sur site",
  "Vestiaires disponibles à l'entrée",
  "Interdiction d'introduire de l'alcool extérieur",
];

/** Affiche l'icône checkmark utilisée dans les listes d'infos. */
function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 shrink-0 text-(--color-1)"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/** Affiche un bloc titre + liste d'informations avec icônes checkmark.
 * @param {string} props.title Titre de la section.
 * @param {string[]} props.items Liste des éléments à afficher.
 */
function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-12 h-1 bg-(--color-1) rounded-full" />
      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide">{title}</h2>
      <ul className="flex flex-col gap-3 text-sm md:text-base">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <CheckIcon />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Page d'informations pratiques du festival — accès, restauration et infos sur place. */
export default function Page() {
  return (
    <section className="section-page">
      <h1 className="title1">Infos pratiques</h1>

      <div className="flex flex-col gap-16 max-w-5xl mx-auto w-full">
        {/* Accès & Localisation — texte à gauche, carte à droite */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex flex-col gap-4 lg:w-2/5">
            <div className="w-12 h-1 bg-(--color-1) rounded-full" />
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide">
              Accès & Localisation
            </h2>
            <div>
              <p className="font-bold uppercase">{FESTIVAL_LOCATION.name}</p>
              <p className="text-sm opacity-70 uppercase mt-1">{FESTIVAL_LOCATION.address}</p>
              <p className="text-sm opacity-70 uppercase">{FESTIVAL_LOCATION.city}</p>
            </div>
            <ul className="flex flex-col gap-3 text-sm md:text-base">
              {ACCES_INFOS.map((info) => (
                <li key={info} className="flex items-start gap-3">
                  <CheckIcon />
                  <span>{info}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full lg:w-3/5 rounded-md overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d5570.61407394697!2d0.120396!3d45.724937!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47fe2f2dc27ba211%3A0x778504b1bfd88bfe!2sSalle%20des%20Fins%20Bois!5e0!3m2!1sfr!2sfr!4v1777205427993!5m2!1sfr!2sfr"
              className="w-full h-72 lg:h-96 block"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localisation du festival"
            />
          </div>
        </div>

        {/* Restauration & Sur place — deux colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <InfoBlock title="Restauration & Buvette" items={RESTAURATION_INFOS} />
          <InfoBlock title="Sur place" items={SUR_PLACE_INFOS} />
        </div>
      </div>
    </section>
  );
}
