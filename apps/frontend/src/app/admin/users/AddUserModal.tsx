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
  handleUser: (user: {
    id: string;
    email: string;
    display_name: string | null;
    role: string;
    created_at: string;
  }) => void;
  selectedUser?: {
    id: string;
    email: string;
    display_name: string | null;
    role: string;
    created_at: string;
  } | null;
};

type CreateUserApiResponse = {
  message: string;
  temporary_password?: string;
  user?: {
    id: string;
    email: string;
    display_name: string | null;
    role: string;
    created_at: string;
  };
};

/** Verifie si le formulaire d'ajout utilisateur est incomplet.
 * Retourne `true` si au moins un champ requis est vide.
 * @param {string} firstName Champ prenom
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
 * @param {(user) => void} params.onUserSaved Notifie le parent apres creation/modification reussie.
 * @function apiRequest -Envoie une requete HTTP a l'API avec `fetch`
 * @function getApiErrorMessage - Definit un message a retourner a l'utilisateur selon le statut de l'erreur
 */
async function submitAddUserForm({
  event,
  isFormInvalid,
  isEditMode,
  selectedUserId,
  selectedUser,
  firstName,
  lastName,
  email,
  role,
  setIsSubmitting,
  setSubmitError,
  setTemporaryPassword,
  resetForm,
  handleUser,
}: {
  event: FormEvent<HTMLFormElement>;
  isFormInvalid: boolean;
  isEditMode: boolean;
  selectedUserId: string | null;
  selectedUser?: {
    id: string;
    email: string;
    display_name: string | null;
    role: string;
    created_at: string;
  } | null;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setSubmitError: Dispatch<SetStateAction<string | null>>;
  setTemporaryPassword: Dispatch<SetStateAction<string | null>>;
  resetForm: () => void;
  handleUser: (user: {
    id: string;
    email: string;
    display_name: string | null;
    role: string;
    created_at: string;
  }) => void;
}) {
  // Empeche le comportement par defaut du formulaire et stoppe la soumission si le formulaire est invalide
  event.preventDefault();
  if (isFormInvalid) {
    return;
  }

  // Indique que la soumission est en cours et nettoie les erreurs ou mots de passe precedemment affiches
  setIsSubmitting(true);
  setSubmitError(null);
  setTemporaryPassword(null);

  // Verifie ci il sagit d'une creation ou d'une modification
  const requestPath =
    isEditMode && selectedUserId
      ? `/admin/users/${selectedUserId}`
      : "/admin/users";
  const requestMethod = isEditMode ? "PATCH" : "POST";

  // Envoie une requete API en mode creation ou modification
  const result = await apiRequest<CreateUserApiResponse>(requestPath, {
    method: requestMethod,
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

  // Stocke le mot de passe temporaire uniquement apres creation
  setTemporaryPassword(
    isEditMode ? null : (result.data.temporary_password ?? null),
  );
  const fallbackUser = {
    id: selectedUserId ?? "",
    email,
    display_name: `${firstName} ${lastName}`.trim(),
    role,
    created_at: selectedUser?.created_at ?? new Date().toISOString(),
  };
  handleUser(result.data.user ?? fallbackUser);
  resetForm();
  setIsSubmitting(false);
}

/** Affiche la modale d'ajout utilisateur.
 * Gere les champs du formulaire, la soumission API et les retours visuels (erreur/succes).
 * @param {AddUserModalProps} props Proprietes de controle de la modale.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {() => void} props.onClose Ferme la modale.
 * @param {(user) => void} props.handleUser Met a jour la liste des users et ferme la modale.
 * @param  * @param {UserToDelete | null} props.selectedUser Utilisateur selectionne pour la modification.
 * @children ModalCloseButton Ferme la modale.
 */
export default function AddUserModal({
  isOpen,
  onClose,
  handleUser,
  selectedUser = null,
}: AddUserModalProps) {
  const isEditMode = selectedUser !== null;

  // Champs du formulaire utilisateur
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  // Gestion des erreurs lors de la soumission du formulaire
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Stocke le mot de passe temporaire retourne apres la creation
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  );
  // Indique si le formulaire envoye
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Definit l'element racine de l'application pour l'accessibilite de la modal
  useEffect(() => {
    Modal.setAppElement("#app-root");
  }, []);

  // Pre-remplit les champs lorsque la modal est ouverte en mode modification.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Reset formulaire si pas d'utilisateur
    if (!selectedUser) {
      setFirstName("");
      setLastName("");
      setEmail("");
      setRole("");
      return;
    }

    // Recupere et nettoie le display_name, puis separe le prenom du reste du nom
    const displayName = selectedUser.display_name?.trim() ?? "";
    const [firstNameValue, ...lastNameParts] = displayName.split(/\s+/);

    // Met a jour les champs du formulaire avec les donnees de l'utilisateur selectionne
    setFirstName(firstNameValue ?? "");
    setLastName(lastNameParts.join(" "));
    setEmail(selectedUser.email);
    setRole(selectedUser.role);
  }, [isOpen, selectedUser]);

  // Verifie si le formulaire d'ajout utilisateur est incomplet.
  const isFormInvalid = isAddUserFormInvalid(firstName, lastName, email, role);

  // Reinitialise les champs du formulaire
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("");
  };

  // Gere la soumission du formulaire d'ajout d'utilisateur
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) =>
    submitAddUserForm({
      event,
      isFormInvalid,
      isEditMode,
      selectedUserId: selectedUser?.id ?? null,
      selectedUser,
      firstName,
      lastName,
      email,
      role,
      setIsSubmitting,
      setSubmitError,
      setTemporaryPassword,
      resetForm,
      handleUser,
    });

  // Gere la fermeture de la modal et reinitialise les etats associes
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

      <div className="m-(--space-md)">
        <form className="form-modal" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-(--space-md) md:grid-cols-2">
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

          <div className="grid grid-cols-1 gap-(--space-md) md:grid-cols-2">
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
              {isEditMode ? "Modifier" : "Ajouter"}
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
