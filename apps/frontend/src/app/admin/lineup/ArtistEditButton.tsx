"use client";

import { useState } from "react";
import type { ArtistItem } from "../../../type";
import AddArtistModal from "./AddArtistModal";

/** Bouton d'édition et modale d'édition pour la page de détail artiste.
 * @param {ArtistItem} props.artist Artiste à modifier.
 * @param {(artist: ArtistItem) => void} props.onArtistEdited Appelé avec l'artiste mis à jour après édition réussie.
 */
export default function ArtistEditButton({
  artist,
  onArtistEdited,
}: {
  artist: ArtistItem;
  onArtistEdited: (artist: ArtistItem) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleArtistEdited = (updatedArtist: ArtistItem) => {
    onArtistEdited(updatedArtist);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="detail-edit-area">
        <button
          type="button"
          className="btn-cta"
          onClick={() => setIsModalOpen(true)}
        >
          Modifier
        </button>
      </div>
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
