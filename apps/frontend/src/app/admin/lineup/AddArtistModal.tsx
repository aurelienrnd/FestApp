"use client";

import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";

type AddArtistModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/** Affiche la modale d'ajout d'un artiste.
 * @param {AddArtistModalProps} props Proprietes de controle de la modale.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {() => void} props.onClose Ferme la modale.
 * @children ModalCloseButton Ferme la modale.
 */
export default function AddArtistModal({ isOpen, onClose }: AddArtistModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Ajout artiste"
      className="modal"
      overlayClassName="modal-overlay"
    >
      <ModalCloseButton onClose={onClose} />
      <h2 className="title-modal">Artiste</h2>
    </Modal>
  );
}
