import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

type ModalCloseButtonProps = {
  onClose: () => void;
};

export default function ModalCloseButton({ onClose }: ModalCloseButtonProps) {
  return (
    <div className="flex w-full justify-end">
      <button type="button" onClick={onClose} aria-label="Fermer la modal">
        <FontAwesomeIcon icon={faX} />
      </button>
    </div>
  );
}
