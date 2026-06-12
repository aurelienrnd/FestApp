"use client";

import { useEffect } from "react";
import Modal from "react-modal";

/** Initialise l'element racine pour react-modal une seule fois au niveau du layout.
 * Permet d'eviter la duplication de Modal.setAppElement dans chaque composant.
 */
export default function ModalSetup() {
  useEffect(() => {
    Modal.setAppElement("#app-root");
  }, []);

  return null;
}
