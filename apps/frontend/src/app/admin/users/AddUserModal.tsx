"use client";

import { useEffect, useState, type FormEvent } from "react";
import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import { apiRequest } from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";
import type { UserListRow } from "../../../types";

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  handleUser: (user: UserListRow) => void;
  selectedUser?: UserListRow | null;
};

type CreateUserApiResponse = {
  message: string;
  user?: UserListRow;
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

  // Initialise les champs depuis selectedUser en mode modification, vide en mode creation
  const displayName = selectedUser?.display_name?.trim() ?? "";
  const [initialFirstName, ...initialLastNameParts] = displayName.split(/\s+/);

  // Champs du formulaire utilisateur
  const [firstName, setFirstName] = useState(initialFirstName ?? "");
  const [lastName, setLastName] = useState(initialLastNameParts.join(" "));
  const [email, setEmail] = useState(selectedUser?.email ?? "");
  const [role, setRole] = useState(selectedUser?.role ?? "");

  // Gestion des erreurs lors de la soumission du formulaire
  const [error, setError] = useState<string | null>(null);
  // Indique si le formulaire envoye
  const [isLoading, setIsLoading] = useState(false);

  // Definit l'element racine de l'application pour l'accessibilite de la modal
  useEffect(() => {
    Modal.setAppElement("#app-root");
  }, []);

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
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isFormInvalid) return;

    setIsLoading(true);
    setError(null);

    // Verifie ci il sagit d'une creation ou d'une modification
    const requestPath =
      isEditMode && selectedUser?.id
        ? `/admin/users/${selectedUser.id}`
        : "/admin/users";
    const requestMethod = isEditMode ? "PATCH" : "POST";

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

    if (result.error) {
      setError(getApiErrorMessage(result.error));
      setIsLoading(false);
      return;
    }

    const fallbackUser = {
      id: selectedUser?.id ?? "",
      email,
      display_name: `${firstName} ${lastName}`.trim(),
      role,
      created_at: selectedUser?.created_at ?? new Date().toISOString(),
    };
    handleUser(result.data.user ?? fallbackUser);
    resetForm();
    setIsLoading(false);
  };

  // Gere la fermeture de la modal et reinitialise les etats associes
  const handleClose = () => {
    setError(null);
    setIsLoading(false);
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
              disabled={isFormInvalid || isLoading}
            >
              {isEditMode ? "Modifier" : "Ajouter"}
            </button>
          </div>
          {error ? (
            <p className="text-center text-(--color-1)">{error}</p>
          ) : null}
        </form>
      </div>
    </Modal>
  );
}
