"use client";

import {
  useEffect,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import { apiRequest } from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
};

type CreateUserApiResponse = {
  message: string;
  temporary_password?: string;
};

/** Verifie si le formulaire d'ajout utilisateur est incomplet.
 * Retourne `true` si au moins un champ requis est vide.
 * @param {string} firstName Champ prénom
 * @param {string} lastName Champ Nom
 * @param {string} email Champ email
 * @param {string} role Champ role
 */
function isAddUserFormInvalid(
  firstName: string,
  lastName: string,
  email: string,
  role: string,
) {
  return (
    firstName.trim() === "" ||
    lastName.trim() === "" ||
    email.trim() === "" ||
    role.trim() === ""
  );
}

/** Soumet le formulaire d'ajout utilisateur et applique les mises a jour d'etat.
 * Annule la soumission native, envoie la requete API, gere l'erreur et notifie le parent en cas de succes.
 * @param {Object} params Parametres de soumission.
 * @param {FormEvent<HTMLFormElement>} params.event Evenement de soumission du formulaire.
 * @param {boolean} params.isFormInvalid Indique si le formulaire est invalide.
 * @param {string} params.firstName Valeur du champ prenom.
 * @param {string} params.lastName Valeur du champ nom.
 * @param {string} params.email Valeur du champ email.
 * @param {string} params.role Valeur du champ role.
 * @param {Dispatch<SetStateAction<boolean>>} params.setIsSubmitting Met a jour l'etat d'envoi.
 * @param {Dispatch<SetStateAction<string | null>>} params.setSubmitError Met a jour le message d'erreur.
 * @param {Dispatch<SetStateAction<string | null>>} params.setTemporaryPassword Met a jour le mot de passe temporaire.
 * @param {() => void} params.resetForm Reinitialise les champs du formulaire.
 * @param {() => void} params.onUserCreated Notifie le parent apres creation reussie.
 * @function apiRequest -Envoie une requete HTTP a l'API avec `fetch`
 * @function getApiErrorMessage - Définit un message à retourner à l'utilisateur selon le statut de l'erreur
 */
async function submitAddUserForm({
  event,
  isFormInvalid,
  firstName,
  lastName,
  email,
  role,
  setIsSubmitting,
  setSubmitError,
  setTemporaryPassword,
  resetForm,
  onUserCreated,
}: {
  event: FormEvent<HTMLFormElement>;
  isFormInvalid: boolean;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setSubmitError: Dispatch<SetStateAction<string | null>>;
  setTemporaryPassword: Dispatch<SetStateAction<string | null>>;
  resetForm: () => void;
  onUserCreated: () => void;
}) {
  // Empêche le comportement par défaut du formulaire et le stoppe la soumission si le formulaire est invalide
  event.preventDefault();
  if (isFormInvalid) {
    return;
  }

  // Indique que la soumission est en cours et nettoie les erreurs ou mots de passe précédemment affichés
  setIsSubmitting(true);
  setSubmitError(null);
  setTemporaryPassword(null);

  // Envoie une requête POST à l’API pour créer un nouvel utilisateur
  const result = await apiRequest<CreateUserApiResponse>("/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      first_name: firstName,
      last_name: lastName,
      role,
    }),
  });

  // Gestion erreur API
  if (result.error) {
    setSubmitError(getApiErrorMessage(result.error));
    setIsSubmitting(false);
    return;
  }

  // Stocke le mot de passe temporaire retourné réinitialise le formulaire, puis met à jour l’état et notifie la création
  setTemporaryPassword(result.data.temporary_password ?? null);
  resetForm();
  setIsSubmitting(false);
  onUserCreated();
}

/** Affiche la modale d'ajout utilisateur.
 * Gere les champs du formulaire, la soumission API et les retours visuels (erreur/succes).
 * @param {AddUserModalProps} props Proprietes de controle de la modale.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {() => void} props.onClose Ferme la modale.
 * @param {() => void} props.onUserCreated Notifie le parent apres creation reussie.
 * @children ModalCloseButton Ferme la modale.
 */
export default function AddUserModal({
  isOpen,
  onClose,
  onUserCreated,
}: AddUserModalProps) {
  // Champs du formulaire utilisateur
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  // Gestion des erreurs lors de la soumission du formulaire
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Stocke le mot de passe temporaire retourné après la création
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  );
  // Indique si le formulaire envoyé
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Définit l’élément racine de l’application pour l’accessibilité de la modal
  useEffect(() => {
    Modal.setAppElement("#app-root");
  }, []);

  // Verifie si le formulaire d'ajout utilisateur est incomplet.
  const isFormInvalid = isAddUserFormInvalid(firstName, lastName, email, role);

  // Réinitialise les champs du formulaire
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("");
  };

  // Gère la soumission du formulaire d’ajout d’utilisateur
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) =>
    submitAddUserForm({
      event,
      isFormInvalid,
      firstName,
      lastName,
      email,
      role,
      setIsSubmitting,
      setSubmitError,
      setTemporaryPassword,
      resetForm,
      onUserCreated,
    });

  // Gère la fermeture de la modal et réinitialise les états associés
  const handleClose = () => {
    setSubmitError(null);
    setTemporaryPassword(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Ajout utilisateur"
      className="modal"
      overlayClassName="modal-overlay"
    >
      <ModalCloseButton onClose={handleClose} />
      <h2 className="title-modal">Utilisateur</h2>

      <div className="m-(--spacing-around-meduim)">
        <form className="form-modal" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-(--gap-content-small) md:grid-cols-2">
            <div>
              <label htmlFor="userFirstName" className="sr-only">
                Prenom
              </label>

              <input
                id="userFirstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Prenom"
                className="input"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="userLastName" className="sr-only">
                Nom
              </label>

              <input
                id="userLastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Nom"
                className="input"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-(--gap-content-small) md:grid-cols-2">
            <div>
              <label htmlFor="userEmail" className="sr-only">
                Email
              </label>

              <input
                id="userEmail"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email"
                className="input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="userRole" className="sr-only">
                Role
              </label>

              <select
                id="userRole"
                name="role"
                className="input"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="" disabled>
                  Role
                </option>

                <option value="admin">Admin</option>
                <option value="lineup">Line up</option>
                <option value="news">News</option>
              </select>
            </div>
          </div>

          <div className="submit-modal-area">
            <button
              type="submit"
              className="btn-cta"
              disabled={isFormInvalid || isSubmitting}
            >
              Ajouter"
            </button>
          </div>
          {submitError ? (
            <p className="text-center text-(--color-1)">{submitError}</p>
          ) : null}
        </form>
      </div>
    </Modal>
  );
}
