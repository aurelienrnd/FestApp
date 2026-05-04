import type { HomeData } from "../../type";
import HomeHero from "./HomeHero";
import HomeInfosPratiques from "./HomeInfosPratiques";
import HomeNews from "./HomeNews";
import HomePartenaires from "./HomePartenaires";
import HomeProgrammation from "./HomeProgrammation";

/** Page d'accueil publique — composant serveur avec ISR (revalidation toutes les 60 secondes).
 * Récupère les données agrégées depuis GET /public/home.
 */
export default async function Home() {
  const apiUrl = process.env.API_URL_SERVER || process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${apiUrl}/public/home`, {
    next: { revalidate: 60 },
  });

  const data: HomeData = res.ok
    ? await res.json()
    : { artists: [], articles: [] };

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
