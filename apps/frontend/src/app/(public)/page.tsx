import type { HomeArtist, HomeArticle } from "../../type";
import HomeHero from "./HomeHero";
import HomeInfosPratiques from "./HomeInfosPratiques";
import HomeNews from "./HomeNews";
import HomePartenaires from "./HomePartenaires";
import HomeProgrammation from "./HomeProgrammation";
import { fetchPublic } from "../../functions/fetchPublic";

/** Page d'accueil publique — composant serveur avec ISR (revalidation toutes les 60 secondes).
 * Récupère les données agrégées depuis GET /public/home.
 * @function fetchPublic Effectue un fetch GET côté serveur avec revalidation ISR.
 */
export default async function Home() {
  const data = await fetchPublic<{ artists: HomeArtist[]; articles: HomeArticle[] }>(
    "/public/home",
  ) ?? { artists: [], articles: [] };

  return (
    <>
      <HomeHero />
      <HomeProgrammation artists={data.artists} />
      <HomeNews articles={data.articles} />
      <HomeInfosPratiques />
      <HomePartenaires />
    </>
  );
}
