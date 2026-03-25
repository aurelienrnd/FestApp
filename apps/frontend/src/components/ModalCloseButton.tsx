import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

type ModalCloseButtonProps = {
  onClose: () => void;
  absolute?: boolean;
};

/** Affiche un bouton de fermeture pour une fenêtre modale.
 * En mode normal, aligné à droite via flexbox.
 * En mode absolute, positionné en haut à droite par-dessus le contenu.
 * @param {() => void} onClose Fonction exécutée pour fermer la modal
 * @param {boolean} absolute Si true, positionne le bouton en absolu (utile pour les modals à layout complexe)
 */
export default function ModalCloseButton({
  onClose,
  absolute = false,
}: ModalCloseButtonProps) {
  if (absolute) {
    return (
      <button
        type="button"
        className="absolute top-(--space-sm) right-(--space-sm) z-10 text-black cursor-pointer"
        onClick={onClose}
        aria-label="Fermer la modal"
      >
        <FontAwesomeIcon icon={faX} />
      </button>
    );
  }

  return (
    <div className="flex w-full justify-end pr-(--space-md)">
      <button type="button" onClick={onClose} aria-label="Fermer la modal">
        <FontAwesomeIcon icon={faX} />
      </button>
    </div>
  );
}
