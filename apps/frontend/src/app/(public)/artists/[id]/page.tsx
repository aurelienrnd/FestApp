import { notFound } from "next/navigation";
import type { ArtistItem } from "../../../../type";
import ArtistDetailContent from "../../../../components/ArtistDetailContent";
import { fetchPublic } from "../../../../functions/fetchPublic";

/** Page publique de détail d'un artiste — composant serveur.
 * Récupère l'artiste via GET /public/artists/:id et le passe à ArtistDetailContent.
 * Redirige vers /artists si l'artiste n'existe pas.
 * @param {{ id: string }} props.params Paramètres de route dynamique.
 * @function fetchPublic Effectue un fetch GET côté serveur avec revalidation ISR.
 * @children Composant affichant les détails de l'artiste.
 */
export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // initialise la requête pour récupérer les données de l'artiste en fonction de l'id
  const { id } = await params;
  const data = await fetchPublic<{ artist: ArtistItem }>(
    `/public/artists/${id}`,
  );

  // si aucune donnée n'est retournée, redirige vers la page 404
  if (!data) notFound();

  return <ArtistDetailContent artist={data.artist} />;
}
