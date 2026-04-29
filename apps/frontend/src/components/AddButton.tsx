"use client";

import { useState } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSliders } from "@fortawesome/free-solid-svg-icons";
import type { NavItem } from "../config/ui";
import { useNavPath } from "../hooks/useNavPath";
import ModalCloseButton from "./ModalCloseButton";
import Navigation from "./Navigation";

/** Affiche un bouton "plus" qui ouvre une modale de filtres.
 * @param {Object} props proprietes du composant
 * @param {NavItem[]} props.items elements affiches dans la navigation de la modale
 * @param {string} [props.className] classes CSS additionnelles
 */
export default function AddButton({
  items,
}: {
  items: NavItem[];
  className?: string;
}) {
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
