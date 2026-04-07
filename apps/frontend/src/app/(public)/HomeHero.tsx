import Image from "next/image";
import Link from "next/link";
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
      <div className="home-hero-inner">
        <Image
          src={logo}
          alt="Logo Vindhellfest"
          priority
          className="w-48 md:w-72"
        />
        <div className="flex gap-(--space-md)">
          <a
            href="https://www.google.com/search?q=tiket+master&rlz=1C1ONGR_frFR1184FR1184&oq=tiket+master&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCDM1ODJqMGo3qAIIsAIB&sourceid=chrome&ie=UTF-8"
            className="btn-cta uppercase"
            target="_blank"
            rel="noopener noreferrer"
          >
            Billetterie
          </a>
          <Link href="/lineup" className="btn-cta uppercase">
            Programmation
          </Link>
        </div>
      </div>
    </section>
  );
}
