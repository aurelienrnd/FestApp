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

/** Affiche la modale de detail d'un artiste — photo, nom, date de concert, bio et icones reseaux sociaux decoratives.
 * Colonne gauche : photo puis date. Colonne droite : nom (fond rouge) puis bio.
 * Barre sociale pleine largeur en bas avec les couleurs de marque.
 * @param {ArtistDetailModalProps} props Proprietes de controle de la modale.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {() => void} props.onClose Ferme la modale.
 * @param {ArtistListRow | null} props.artist Artiste a afficher.
 * @children ModalCloseButton Ferme la modale.
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
          <button
            type="button"
            className="artist-detail-close-btn"
            onClick={onClose}
            aria-label="Fermer la modal"
          >
            <FontAwesomeIcon icon={faX} />
          </button>
          <div className="artist-detail-top">
            {/* Colonne gauche : image + date */}
            <div className="artist-detail-left">
              <div className="artist-detail-img-wrapper">
                <Image
                  src={artist.url_media}
                  alt={artist.description_media}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="artist-detail-date-block">
                {artist.start_time
                  ? formatConcertDateTime(artist.start_time)
                  : "Date non definie"}
              </div>
            </div>

            {/* Colonne droite : nom + bio */}
            <div className="artist-detail-right">
              <div className="artist-detail-name-block">
                <h2 className="artist-detail-name">{artist.name}</h2>
              </div>
              <div className="artist-detail-bio">
                <p>{artist.bio}</p>
              </div>
            </div>
          </div>

          {/* Barre sociale pleine largeur */}
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
