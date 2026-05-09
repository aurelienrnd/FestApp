"use client";

import { useState, type FormEvent } from "react";
import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import { useMutation } from "../../../hooks/useMutation";
import type { UserItem, CreateApiResponse } from "../../../type";
import { USER_ROLES } from "../../../config/ui";

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  handleUser: (user: UserItem) => void;
  userToEdit?: UserItem | null;
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

/** Affiche la modale d'ajout ou de modification d'un utilisateur.
 * Gere les champs du formulaire, la soumission API et les retours visuels (erreur/succes).
 * En mode edition (userToEdit defini), pre-remplit les champs et affiche "Modifier" a la place de "Ajouter".
 * @param {AddUserModalProps} props Proprietes de controle de la modale.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {() => void} props.onClose Ferme la modale.
 * @param {(user) => void} props.handleUser Met a jour la liste des users et ferme la modale.
 * @param {UserItem | null} props.userToEdit Utilisateur a modifier — pre-remplit le formulaire si defini.
 * @children ModalCloseButton Ferme la modale.
 */
export default function AddUserModal({
  isOpen,
  onClose,
  handleUser,
  userToEdit = null,
}: AddUserModalProps) {
  const isEditMode = userToEdit !== null;

  // Initialise les champs depuis userToEdit en mode modification, vide en mode creation
  const displayName = userToEdit?.display_name?.trim() ?? "";
  const [initialFirstName, ...initialLastNameParts] = displayName.split(/\s+/);

  // Champs du formulaire utilisateur
  const [firstName, setFirstName] = useState(initialFirstName ?? "");
  const [lastName, setLastName] = useState(initialLastNameParts.join(" "));
  const [email, setEmail] = useState(userToEdit?.email ?? "");
  const [role, setRole] = useState(userToEdit?.role ?? "");

  const { mutate, isLoading, error, reset } = useMutation<CreateApiResponse<{ user: UserItem }>>(
    isEditMode ? `/admin/users/${userToEdit!.id}` : "/admin/users",
    isEditMode ? "PATCH" : "POST",
  );


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

    mutate({ email, first_name: firstName, last_name: lastName, role }, (data) => {
      handleUser(data.user);
      resetForm();
    });
  };

  // Gere la fermeture de la modal et reinitialise les etats associes
  const handleClose = () => {
    reset();
    resetForm();
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

      <div className="m-6">
        <form className="form-modal" onSubmit={handleSubmit}>
          <div className="form-grid">
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

          <div className="form-grid">
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

                {USER_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
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
            <p className="error-message">{error}</p>
          ) : null}
        </form>
      </div>
    </Modal>
  );
}
