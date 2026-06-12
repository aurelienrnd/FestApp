"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "../../../../hooks/useRoleGuard";
import { useFetch } from "../../../../hooks/useFetch";
import type { ArtistItem } from "../../../../type";
import ArtistDetailContent from "../../../../components/ArtistDetailContent";
import ArtistEditButton from "../ArtistEditButton";
import LoadingLine from "../../../../components/LoadingLine";

/** Page admin de détail d'un artiste.
 * Récupère l'artiste via GET /public/artists/:id avec les cookies d'auth.
 * Les restrictions de rôle de /admin/artists s'appliquent automatiquement via useRoleGuard.
 * @function useRoleGuard Redirige les utilisateurs non autorisés.
 * @function useFetch Récupère les données de l'artiste.
 * @children ArtistDetailContent Affiche les informations complètes de l'artiste.
 * @children ArtistEditButton Bouton d'édition réservé à l'interface admin.
 */
export default function AdminArtistPage() {
  // Applique les restrictions de rôle pour accéder à cette page
  useRoleGuard();

  // Récupère l'ID de l'artiste depuis les paramètres d'URL et les données de l'artiste via une requête GET
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useFetch<{ artist: ArtistItem }>(
    `/public/artists/${id}`,
  );

  // Stocke uniquement la valeur après édition — null tant que l'utilisateur n'a pas modifié
  const [editedArtist, setEditedArtist] = useState<ArtistItem | null>(null);
  const artist = editedArtist ?? data?.artist ?? null;

  // Affiche un état de chargement ou une erreur si nécessaire
  if (isLoading) return <LoadingLine />;
  if (error || !artist) return <p className="content-centered">{error}</p>;

  return (
    <>
      <ArtistDetailContent artist={artist} backPath="/admin/artists" />
      <ArtistEditButton
        artist={artist}
        onArtistEdited={(updated) => setEditedArtist(updated)}
      />
    </>
  );
}
