import type { HomeArtist, HomeNews } from "../../type";
import HomeHero from "./HomeHero";
import HomeInfosPratiques from "./HomeInfosPratiques";
import HomeNews from "./HomeNews";
import HomePartenaires from "./HomePartenaires";
import HomeProgrammation from "./HomeProgrammation";
import { fetchPublic } from "../../functions/fetchPublic";

/** Page d'accueil publique — composant serveur avec ISR (revalidation toutes les 60 secondes).
 * Récupère les données agrégées depuis GET /public/home.
 * @function fetchPublic Effectue un fetch GET côté serveur avec revalidation ISR.
 * @children HomeHero
 * @children HomeProgrammation
 * @children HomeNews
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
      <HomeNews newsList={data.news ?? []} />
      <HomeInfosPratiques />
      <HomePartenaires />
    </>
  );
}
