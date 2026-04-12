import Image from "next/image";
import logo from "../../../public/hero_logo.webp";

/** Affiche la section hero de la page d'accueil — logo centré, bouton billetterie et lien vers la programmation.
 * Composant serveur — pas de données dynamiques.
 */
export default function HomeHero() {
  return (
    <section
      className="home-hero"
      style={{ backgroundImage: "url('/hero_bg.webp')" }}
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
            <span className="bg-white text-black text-lg lg:text-2xl flex justify-center items-center py-6 w-[40%] lg:w-[20%]">DU</span>
            <span className="bg-white text-black text-lg lg:text-2xl flex justify-center items-center py-6 w-[80%] lg:w-[50%]">
              SAMEDI 23 AOUT
            </span>
            <span className="bg-white text-black text-lg lg:text-2xl flex justify-center items-center py-6 w-[40%] lg:w-[20%]">AU</span>
            <span className="bg-white text-black text-lg lg:text-2xl flex justify-center items-center py-6 w-[80%] lg:w-[50%]">
              DIMANCHE 24 AOUT
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
            <span className="bg-white text-black text-lg lg:text-2xl flex justify-center items-center py-6 w-[50%]">VINDELLE</span>
          </div>
        </div>
      </div>
    </section>
  );
}
