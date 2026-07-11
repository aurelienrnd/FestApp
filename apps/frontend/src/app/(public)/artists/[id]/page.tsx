import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import type { ArtistItem } from "../../../../type";
import ArtistDetailContent from "../../../../components/ArtistDetailContent";
import { fetchPublic } from "../../../../functions/fetchPublic";

/** Recupere l'artiste par son id, est l'enregistre en cache pour eviter de refaire la requete si l'id est le meme.*/
const getArtist = cache((id: string) =>
  fetchPublic<{ artist: ArtistItem }>(`/public/artists/${id}`),
);

/** Genere les metadata (titre, description) a partir des donnees de l'artiste.
 * @param {{ id: string }} props.params Paramètres de route dynamique.
 * @function getArtist Recupere l'artiste (memoise par requete).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  // initialise la requête pour récupérer les données de l'artiste en fonction de l'id
  const { id } = await params;
  const data = await getArtist(id);

  // affiche des metadata par défaut n'est pas utile, car la page est un composant serveur et redirige vers 404 si l'artiste n'existe pas
  if (!data) return {};

  const { name, genre } = data.artist;
  return {
    title: `${name} | Vindhellfest`,
    description: `${name} — ${genre}. Retrouvez cet artiste dans la programmation du Vindhellfest.`,
  };
}

/** Page publique de détail d'un artiste — composant serveur.
 * Récupère l'artiste via GET /public/artists/:id et le passe à ArtistDetailContent.
 * Redirige vers /artists si l'artiste n'existe pas.
 * @param {{ id: string }} props.params Paramètres de route dynamique.
 * @function getArtist Recupere l'artiste (memoise par requete).
 * @children Composant affichant les détails de l'artiste.
 */
export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // initialise la requête pour récupérer les données de l'artiste en fonction de l'id
  const { id } = await params;
  const data = await getArtist(id);

  // si aucune donnée n'est retournée, redirige vers la page 404
  if (!data) notFound();

  return <ArtistDetailContent artist={data.artist} />;
}
