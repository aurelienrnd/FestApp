import Image from "next/image";
import logo from "../../../public/header_logo.png";

/** Affiche la section hero de la page d'accueil — logo centré, bouton billetterie et lien vers la programmation.
 * Composant serveur — pas de données dynamiques.
 */
export default function HomeHero() {
  return (
    <section
      className="home-hero"
      style={{ backgroundImage: "url('/hero_bg.webp')" }}
    >
      <div className="w-full h-2/3 flex flex-col items-center justify-start mt-(--header-height)">
        <Image
          src={logo}
          alt="Logo Vindhellfest"
          priority
          className="py-(--margin-bottom-title)"
        />

        <div className="w-full h-full flex flex-row-reverse items-center justify-between">
          <div className="h-full flex justify-around flex-col gap-4">
            <a
              href="https://www.google.com/search?q=tiket+master&rlz=1C1ONGR_frFR1184FR1184&oq=tiket+master&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCDM1ODJqMGo3qAIIsAIB&sourceid=chrome&ie=UTF-8"
              className="btn-cta home-hero-btn mr-(--space-lg)"
              target="_blank"
              rel="noopener noreferrer"
            >
              Billetterie
            </a>
            <span className="bg-white w-40 text-black text-lg flex justify-center items-center py-(--space-md)">
              VINDELLE
            </span>
          </div>

          <div className="h-full flex justify-around flex-col gap-4">
            <span className="bg-white w-30 text-black text-lg flex justify-center items-center py-(--space-md)">
              DU
            </span>
            <span className="bg-white w-40 text-black text-lg flex justify-center items-center py-(--space-md)">
              SAMEDI 23 AOUT
            </span>
            <span className="bg-white w-30 text-black text-lg flex justify-center items-center py-(--space-md)">
              AU
            </span>
            <span className="bg-white w-40 text-black text-lg flex justify-center items-center py-(--space-md)">
              DIMANCHE 24 AOUT
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
