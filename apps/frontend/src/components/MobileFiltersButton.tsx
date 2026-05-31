"use client";

import { useState } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSliders } from "@fortawesome/free-solid-svg-icons";
import type { NavItem } from "../type";
import { useNavPath } from "../hooks/useNavPath";
import ModalCloseButton from "./ModalCloseButton";
import Navigation from "./Navigation";

/** Affiche un bouton de filtres (mobile uniquement) qui ouvre une modale de navigation.
 * @param {NavItem[]} props.items elements affiches dans la navigation de la modale
 * @function useNavPath hook pour recupere le pathname et savoir si on est dans une page admin ou non
 * @function ModalCloseButton bouton pour fermer la modale
 * @function Navigation affiche les filtre dans la modale
 */
export default function MobileFiltersButton({ items }: { items: NavItem[] }) {
  // State pour gérer l'ouverture de la modale
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const { pathname, isAdminPath } = useNavPath();

  return (
    <>
      <button
        type="button"
        className="mb-(--ctx-title-mb) md:hidden"
        aria-label="Ouvrir les filtres"
        onClick={() => setIsFiltersModalOpen(true)}
      >
        <FontAwesomeIcon icon={faSliders} />
      </button>

      <Modal
        isOpen={isFiltersModalOpen}
        onRequestClose={() => setIsFiltersModalOpen(false)}
        contentLabel="Filtres"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <ModalCloseButton onClose={() => setIsFiltersModalOpen(false)} />
        <Navigation
          items={items}
          pathname={pathname}
          isAdminPath={isAdminPath}
          variant="modal"
          setmodal={() => setIsFiltersModalOpen(false)}
        />
      </Modal>
    </>
  );
}
