"use client";

import Image from "next/image";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInstagram,
  faYoutube,
  faSpotify,
} from "@fortawesome/free-brands-svg-icons";
import { faX } from "@fortawesome/free-solid-svg-icons";
import type { ArtistListRow } from "../../../types";

type ArtistDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  artist: ArtistListRow | null;
};

/** Formate une date ISO en "JOUR JJ MOIS HHhMM" en francais majuscule.
 * @param {string} isoString Date ISO 8601
 */
function formatConcertDateTime(isoString: string): string {
  const date = new Date(isoString);
  const weekday = date.toLocaleDateString("fr-FR", { weekday: "long" });
  const day = date.toLocaleDateString("fr-FR", { day: "numeric" });
  const month = date.toLocaleDateString("fr-FR", { month: "long" });
  const time = date
    .toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    .replace(":", "H");
  return `${weekday} ${day} ${month} ${time}`.toUpperCase();
}

/** Affiche la modale de detail d'un artiste en layout mobile — image pleine largeur, nom (fond rouge),
 * biographie (fond sombre), date du concert, puis icones reseaux sociaux en bas.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {() => void} props.onClose Ferme la modale.
 * @param {ArtistListRow | null} props.artist Artiste a afficher.
 * @function formatConcertDateTime Formate une date ISO en "JOUR JJ MOIS HHhMM" en francais majuscule.
 */
export default function ArtistDetailModal({
  isOpen,
  onClose,
  artist,
}: ArtistDetailModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Detail artiste"
      className="modal-artist-detail"
      overlayClassName="modal-overlay"
    >
      {artist && (
        <div className="artist-detail-layout">
          {/* Image pleine largeur avec bouton fermer */}
          <div className="artist-detail-img-wrapper">
            <Image
              src={artist.url_media}
              alt={artist.description_media}
              fill
              className="object-cover"
            />
            <button
              type="button"
              className="artist-detail-close-btn"
              onClick={onClose}
              aria-label="Fermer la modal"
            >
              <FontAwesomeIcon icon={faX} />
            </button>
          </div>

          {/* Nom sur fond rouge */}
          <div className="artist-detail-name-block">
            <h2 className="artist-detail-name">{artist.name}</h2>
          </div>

          {/* Biographie */}
          <div className="artist-detail-bio">
            <p>{artist.bio}</p>
          </div>

          {/* Date du concert */}
          <div className="artist-detail-date-block">
            {artist.start_time
              ? formatConcertDateTime(artist.start_time)
              : "Date non definie"}
          </div>

          {/* Reseaux sociaux */}
          <div className="artist-detail-social">
            <FontAwesomeIcon icon={faInstagram} style={{ color: "#e4e4e7" }} />
            <FontAwesomeIcon icon={faYoutube} style={{ color: "#e4e4e7" }} />
            <FontAwesomeIcon icon={faSpotify} style={{ color: "#e4e4e7" }} />
          </div>
        </div>
      )}
    </Modal>
  );
}
