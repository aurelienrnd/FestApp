"use client";

import { useState } from "react";
import type { ArtistItem } from "../../../type";
import { useModal } from "../../../hooks/useModal";
import AddArtistModal from "../../../components/modals/AddArtistModal";

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
  const { isOpen, open, close } = useModal();
  const [editKey, setEditKey] = useState(0);

  const handleArtistEdited = (updatedArtist: ArtistItem) => {
    onArtistEdited(updatedArtist);
    close();
  };

  return (
    <>
      <div className="detail-edit-area">
        <button
          type="button"
          className="btn-cta"
          onClick={() => { setEditKey((k) => k + 1); open(); }}
        >
          Modifier
        </button>
      </div>
      <AddArtistModal
        key={editKey}
        isOpen={isOpen}
        onClose={close}
        handleArtist={handleArtistEdited}
        artistToEdit={artist}
      />
    </>
  );
}
