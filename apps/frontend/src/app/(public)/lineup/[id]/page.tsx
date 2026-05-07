import { notFound } from "next/navigation";
import type { ArtistItem } from "../../../../type";
import ArtistDetailContent from "../../../admin/lineup/ArtistDetailContent";

/** Page publique de détail d'un artiste — composant serveur.
 * Récupère l'artiste via GET /public/lineup/:id et le passe à ArtistDetailContent.
 * Redirige vers /lineup si l'artiste n'existe pas.
 * @param {{ id: string }} props.params Paramètres de route dynamique.
 */
export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apiUrl = process.env.API_URL_SERVER || process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${apiUrl}/public/lineup/${id}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) notFound();

  const { artist }: { artist: ArtistItem } = await res.json();

  return <ArtistDetailContent artist={artist} />;
}
