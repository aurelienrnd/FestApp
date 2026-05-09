"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "../../../../hooks/useRoleGuard";
import { useFetch } from "../../../../hooks/useFetch";
import type { ArtistItem } from "../../../../type";
import ArtistDetailContent from "../../../../components/ArtistDetailContent";
import ArtistEditButton from "../ArtistEditButton";

/** Page admin de détail d'un artiste.
 * Récupère l'artiste via GET /public/lineup/:id avec les cookies d'auth.
 * Les restrictions de rôle de /admin/lineup s'appliquent automatiquement via useRoleGuard.
 * @children ArtistDetailContent Affiche les informations complètes de l'artiste.
 * @children ArtistEditButton Bouton d'édition réservé à l'interface admin.
 */
export default function AdminArtistPage() {
  useRoleGuard();

  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useFetch<{ artist: ArtistItem }>(`/public/lineup/${id}`);

  // État mutable pour les mises à jour locales après édition
  const [artist, setArtist] = useState<ArtistItem | null>(null);
  useEffect(() => {
    setArtist(data?.artist ?? null);
  }, [data]);

  if (isLoading) return null;
  if (error || !artist) return <p className="content-centered">{error}</p>;

  return (
    <>
      <ArtistDetailContent artist={artist} backPath="/admin/lineup" />
      <ArtistEditButton
        artist={artist}
        onArtistEdited={(updated) => setArtist(updated)}
      />
    </>
  );
}
