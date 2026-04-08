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
      <div className="w-full h-2/3 border border-white flex flex-col items-center justify-start mt-(--header-height)">
        <Image
          src={logo}
          alt="Logo Vindhellfest"
          priority
          className="home-hero-logo py-(--margin-bottom-title)"
        />
        <a
          href="https://www.google.com/search?q=tiket+master&rlz=1C1ONGR_frFR1184FR1184&oq=tiket+master&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCDM1ODJqMGo3qAIIsAIB&sourceid=chrome&ie=UTF-8"
          className="btn-cta home-hero-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          Billetterie
        </a>
      </div>
    </section>
  );
}
