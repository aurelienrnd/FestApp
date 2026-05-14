"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "../../../../hooks/useRoleGuard";
import { useFetch } from "../../../../hooks/useFetch";
import type { ArtistItem } from "../../../../type";
import ArtistDetailContent from "../../../../components/ArtistDetailContent";
import ArtistEditButton from "../ArtistEditButton";

/** Page admin de détail d'un artiste.
 * Récupère l'artiste via GET /public/artists/:id avec les cookies d'auth.
 * Les restrictions de rôle de /admin/artists s'appliquent automatiquement via useRoleGuard.
 * @children ArtistDetailContent Affiche les informations complètes de l'artiste.
 * @children ArtistEditButton Bouton d'édition réservé à l'interface admin.
 */
export default function AdminArtistPage() {
  useRoleGuard();

  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useFetch<{ artist: ArtistItem }>(
    `/public/artists/${id}`,
  );

  // Stocke uniquement la valeur après édition — null tant que l'utilisateur n'a pas modifié
  const [editedArtist, setEditedArtist] = useState<ArtistItem | null>(null);
  const artist = editedArtist ?? data?.artist ?? null;

  if (isLoading) return null;
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
