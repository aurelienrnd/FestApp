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
 */
export default async function Home() {
  const data = await fetchPublic<{ artists: HomeArtist[]; newsList: HomeNews[] }>(
    "/public/home",
  ) ?? { artists: [], newsList: [] };

  return (
    <>
      <HomeHero />
      <HomeProgrammation artists={data.artists} />
      <HomeNews newsList={data.newsList ?? []} />
      <HomeInfosPratiques />
      <HomePartenaires />
    </>
  );
}
