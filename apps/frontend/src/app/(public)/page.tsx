import type { Metadata } from "next";
import type { HomeArtist, HomeNews } from "../../type";
import HomeHero from "./HomeHero";
import HomeInfosPratiques from "./HomeInfosPratiques";
import HomeNewsSection from "./HomeNews";
import HomePartenaires from "./HomePartenaires";
import HomeProgrammation from "./HomeProgrammation";
import { fetchPublic } from "../../functions/fetchPublic";

// Métadonnées SEO
export const metadata: Metadata = {
  title: "Vindhellfest — Festival de musique en Charente",
  description:
    "Vindhellfest, festival de musique en Charente : découvrez la programmation, les dernières actualités et toutes les informations pratiques.",
};

/** Page d'accueil publique — composant serveur avec ISR (revalidation toutes les 60 secondes).
 * Récupère les données agrégées depuis GET /public/home.
 * @function fetchPublic Effectue un fetch GET côté serveur avec revalidation ISR.
 * @children HomeHero
 * @children HomeProgrammation
 * @children HomeNewsSection
 * @children HomeInfosPratiques
 * @children HomePartenaires
 */
export default async function Home() {
  // Récupère les données d'artistes et de news pour la page d'accueil depuis l'API publique.
  const data = (await fetchPublic<{ artists: HomeArtist[]; news: HomeNews[] }>(
    "/public/home",
  )) ?? { artists: [], news: [] };

  return (
    <>
      <HomeHero />
      <HomeProgrammation artists={data.artists} />
      <HomeNewsSection newsList={data.news ?? []} />
      <HomeInfosPratiques />
      <HomePartenaires />
    </>
  );
}
