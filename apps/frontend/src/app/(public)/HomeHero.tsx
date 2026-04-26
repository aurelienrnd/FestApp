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
      className="-mt-(--header-height) h-(--home-hero-min-height) min-h-(--home-hero-min-height-floor) bg-[url('/hero_bg.webp')] bg-cover bg-center overflow-x-hidden max-h-[1900px]"
    >
      <div className="mt-(--header-height) h-3/4 flex flex-col items-center gap-4 relative lg:gap-10">
        <h1
          className="w-[180px] sm:w-[250px] h-auto lg:absolute lg:w-[35%]"
          style={{
            animation:
              "blur-in var(--anim-hero-duration) var(--anim-hero-easing) both",
            animationDelay: "0.2s",
            animationDuration: "2.5s",
          }}
        >
          <Image
            src={logo}
            alt="Vind'Hell Fest"
            priority
            className="w-full h-auto"
          />
        </h1>

        <div className="w-full h-full flex justify-between lg:pt-40">
          <div className="w-1/2 flex flex-col justify-between">
            <span
              className="hero-slide-left bg-white text-black sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl flex justify-center items-center py-2 sm:py-4 lg:py-6 w-[40%] h-[15%] lg:w-[20%]"
              style={{ animationDelay: "0.6s" }}
            >
              DU
            </span>
            <span
              className="hero-slide-left bg-white text-black sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl flex justify-center items-center py-2 sm:py-4 lg:py-6 w-[80%] h-[15%] lg:w-[50%]"
              style={{ animationDelay: "0.8s" }}
            >
              {firstDay}
            </span>
            <span
              className="hero-slide-left bg-white text-black sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl flex justify-center items-center py-2 sm:py-4 lg:py-6 w-[40%] h-[15%] lg:w-[20%]"
              style={{ animationDelay: "1.0s" }}
            >
              AU
            </span>
            <span
              className="hero-slide-left bg-white text-black sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl flex justify-center items-center py-2 sm:py-4 lg:py-6 w-[80%] h-[15%] lg:w-[50%]"
              style={{ animationDelay: "1.2s" }}
            >
              {lastDay}
            </span>
          </div>

          <div className="w-1/2 flex flex-col justify-around items-end">
            <a
              href="https://www.google.com/search?q=tiket+master&rlz=1C1ONGR_frFR1184FR1184&oq=tiket+master&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCDM1ODJqMGo3qAIIsAIB&sourceid=chrome&ie=UTF-8"
              className="btn-cta p-3 sm:p-6 justify-center items-center self-center sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
              style={{
                animation:
                  "scale-in var(--anim-hero-duration) var(--anim-hero-easing) both",
                animationDelay: "1.6s",
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Billetterie
            </a>
            <span
              className="bg-white text-black sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl flex justify-center items-center py-2 sm:py-4 lg:py-6 h-[15%] w-[50%]"
              style={{
                animation:
                  "slide-in-right var(--anim-hero-duration) var(--anim-hero-easing) both",
                animationDelay: "1.4s",
              }}
            >
              VINDELLE
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
