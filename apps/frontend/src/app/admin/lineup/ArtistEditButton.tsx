"use client";

import { useState } from "react";
import type { ArtistListRow } from "../../../type";
import AddArtistModal from "./AddArtistModal";

/** Bouton d'édition et modale d'édition pour la page de détail artiste.
 * @param {ArtistListRow} props.artist Artiste à modifier.
 * @param {(artist: ArtistListRow) => void} props.onArtistEdited Appelé avec l'artiste mis à jour après édition réussie.
 */
export default function ArtistEditButton({
  artist,
  onArtistEdited,
}: {
  artist: ArtistListRow;
  onArtistEdited: (artist: ArtistListRow) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleArtistEdited = (updatedArtist: ArtistListRow) => {
    onArtistEdited(updatedArtist);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="btn-action"
        onClick={() => setIsModalOpen(true)}
      >
        Modifier
      </button>
      <AddArtistModal
        key={artist.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        handleArtist={handleArtistEdited}
        artistToEdit={artist}
      />
    </>
  );
}
