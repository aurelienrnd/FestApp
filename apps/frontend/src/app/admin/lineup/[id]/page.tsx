"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRoleGuard } from "../../../../hooks/useRoleGuard";
import { apiRequest } from "../../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../../functions/getApiErrorMessage";
import type { ArtistListRow } from "../../../../types";
import ArtistDetailContent from "../ArtistDetailContent";

/** Page admin de détail d'un artiste.
 * Récupère l'artiste via GET /public/lineup/:id avec les cookies d'auth.
 * Les restrictions de rôle de /admin/lineup s'appliquent automatiquement via useRoleGuard.
 */
export default function AdminArtistPage() {
  useRoleGuard();

  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<ArtistListRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getArtist = async () => {
      setIsLoading(true);
      setError(null);

      const result = await apiRequest<{ artist: ArtistListRow }>(`/public/lineup/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (result.error) {
        setError(getApiErrorMessage(result.error));
        setIsLoading(false);
        return;
      }

      setArtist(result.data?.artist ?? null);
      setIsLoading(false);
    };

    getArtist();
  }, [id]);

  if (isLoading) return null;
  if (error || !artist) return <p className="content-centered">{error}</p>;

  return <ArtistDetailContent artist={artist} />;
}
