import Image from "next/image";
import logo from "../../../public/hero_logo.webp";
import { FESTIVAL_DAYS } from "../../config/festival";

/** Formate une date ISO en "SAMEDI 23 AOÛT" en français majuscule.
 * @param {string} isoDate - Date au format ISO (YYYY-MM-DD)
 */
function formatFestivalDate(isoDate: string): string {
  return new Date(isoDate)
    .toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .toUpperCase();
}

/** Affiche la section hero de la page d'accueil — logo centré, dates du festival, bouton billetterie et lieu.
 * Composant serveur — dates dérivées de FESTIVAL_DAYS.
 */
export default function HomeHero() {
  // Les dates du festival sont dérivées dynamiquement depuis FESTIVAL_DAYS, source de vérité unique pour les dates.
  const firstDay = formatFestivalDate(FESTIVAL_DAYS[0]);
  const lastDay = formatFestivalDate(FESTIVAL_DAYS[FESTIVAL_DAYS.length - 1]);
  return (
    <section
      id="home-hero"
      className="h-(--home-hero-min-height) bg-cover bg-center"
      style={{
        backgroundImage: "url('/hero_bg.webp')",
        marginTop: "calc(-1 * var(--header-height))",
      }}
    >
      <div className="mt-(--header-height) h-3/4 flex flex-col items-center gap-10 relative">
        <Image
          src={logo}
          alt="Logo Vindhellfest"
          priority
          className="w-[250px] h-auto lg:absolute lg:w-[35%]"
        />

        <div className="w-full h-full flex justify-between lg:pt-40">
          <div className="w-1/2 flex flex-col justify-between">
            <span className="bg-white text-black text-lg lg:text-2xl flex justify-center items-center py-6 w-[40%] lg:w-[20%]">
              DU
            </span>
            <span className="bg-white text-black text-lg lg:text-2xl flex justify-center items-center py-6 w-[80%] lg:w-[50%]">
              {firstDay}
            </span>
            <span className="bg-white text-black text-lg lg:text-2xl flex justify-center items-center py-6 w-[40%] lg:w-[20%]">
              AU
            </span>
            <span className="bg-white text-black text-lg lg:text-2xl flex justify-center items-center py-6 w-[80%] lg:w-[50%]">
              {lastDay}
            </span>
          </div>

          <div className="w-1/2 flex flex-col justify-around items-end">
            <a
              href="https://www.google.com/search?q=tiket+master&rlz=1C1ONGR_frFR1184FR1184&oq=tiket+master&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCDM1ODJqMGo3qAIIsAIB&sourceid=chrome&ie=UTF-8"
              className="btn-cta p-6 justify-center items-center self-center lg:text-2xl"
              target="_blank"
              rel="noopener noreferrer"
            >
              Billetterie
            </a>
            <span className="bg-white text-black text-lg lg:text-2xl flex justify-center items-center py-6 w-[50%]">
              VINDELLE
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
