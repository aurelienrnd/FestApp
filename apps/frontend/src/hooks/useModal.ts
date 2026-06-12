"use client";
import { useState } from "react";

/** Gère l'état d'ouverture d'une modale avec item optionnel.
 * Appeler open(item) pour ouvrir avec un élément (édition, suppression),
 * ou open() sans argument pour ouvrir sans contexte (création).
 * @param {boolean} initialOpen Ouvre la modale immédiatement si true (ex : mot de passe provisoire).
 * @return {Object} Un objet contenant :
 * - isOpen : booléen indiquant si la modale est ouverte.
 * - item : l'élément associé à la modale, ou null si aucun.
 * - open : ouvre la modale, accepte un item optionnel.
 * - close : ferme la modale et remet item à null.
 */
export function useModal<T = undefined>(
  initialOpen = false,
): {
  isOpen: boolean;
  item: T | null;
  open: (item?: T | null) => void;
  close: () => void;
} {
  // intitialise l'etat de la modal
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [item, setItem] = useState<T | null>(null);

  /** Ouvre la modale et associe un item optionnel.
   * @param {T | null} newItem Item à associer (édition/suppression), ou omis pour une création.
   */
  const open = (newItem?: T | null) => {
    setItem(newItem ?? null);
    setIsOpen(true);
  };

  /** Ferme la modale et remet l'item à null. */
  const close = () => {
    setIsOpen(false);
    setItem(null);
  };

  return { isOpen, item, open, close };
}
