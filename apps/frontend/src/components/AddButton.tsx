"use client";

import { useEffect, useState } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { NavItem } from "../config/navigation";
import { useAppUi } from "./AppUiProvider";
import ModalCloseButton from "./ModalCloseButton";
import Navigation from "./Navigation";

/** Affiche un bouton "plus" qui ouvre une modale de filtres.
 * @param {Object} props proprietes du composant
 * @param {NavItem[]} props.items elements affiches dans la navigation de la modale
 * @param {string} [props.className] classes CSS additionnelles
 */
export default function AddButton({
  items,
  className,
}: {
  items: NavItem[];
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname, isAdminPath, isDesktop } = useAppUi();

  useEffect(() => {
    Modal.setAppElement("#app-root");
  }, []);

  if (isDesktop) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="mb-12"
        aria-label="Ouvrir les filtres"
        onClick={() => setIsOpen(true)}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="Filtres"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <ModalCloseButton onClose={() => setIsOpen(false)} />
        <Navigation
          items={items}
          pathname={pathname}
          isAdminPath={isAdminPath}
          variant="modal"
          setmodal={() => setIsOpen(false)}
        />
      </Modal>
    </>
  );
}
