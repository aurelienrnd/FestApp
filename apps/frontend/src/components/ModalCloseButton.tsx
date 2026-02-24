import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

type ModalCloseButtonProps = {
  onClose: () => void;
};

/** Affiche un bouton de fermeture aligné à droite pour une fenêtre modale
 * @prop onClose : Fonction exécutée pour fermer la modal
 */
export default function ModalCloseButton({ onClose }: ModalCloseButtonProps) {
  return (
    <div className="flex w-full justify-end pr-(--spacing-container-modal)">
      <button type="button" onClick={onClose} aria-label="Fermer la modal">
        <FontAwesomeIcon icon={faX} />
      </button>
    </div>
  );
}
