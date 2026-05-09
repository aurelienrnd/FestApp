import { notFound } from "next/navigation";
import type { ArtistItem } from "../../../../type";
import ArtistDetailContent from "../../../../components/ArtistDetailContent";
import { fetchPublic } from "../../../../functions/fetchPublic";

/** Page publique de détail d'un artiste — composant serveur.
 * Récupère l'artiste via GET /public/lineup/:id et le passe à ArtistDetailContent.
 * Redirige vers /lineup si l'artiste n'existe pas.
 * @param {{ id: string }} props.params Paramètres de route dynamique.
 * @function fetchPublic Effectue un fetch GET côté serveur avec revalidation ISR.
 */
export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await fetchPublic<{ artist: ArtistItem }>(`/public/lineup/${id}`);

  if (!data) notFound();

  return <ArtistDetailContent artist={data.artist} />;
}
