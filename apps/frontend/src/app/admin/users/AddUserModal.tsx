"use client";

import { useState, type FormEvent } from "react";
import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import { authClient } from "../../../lib/auth-client";
import type { UserItem } from "../../../type";
import { USER_ROLES } from "../../../config/ui";
import { isEmail, isEmpty, isMaxLength } from "../../../functions/validation";

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  handleUserSaved: (user: UserItem) => void;
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
    firstName.trim().length < 2 ||
    isMaxLength(firstName, 30) ||
    lastName.trim().length < 2 ||
    isMaxLength(lastName, 30) ||
    !isEmail(email) ||
    isEmpty(role)
  );
}

/** Affiche la modale d'ajout ou de modification d'un utilisateur.
 * Gere les champs du formulaire, la soumission API et les retours visuels (erreur/succes).
 * En mode edition (userToEdit defini), pre-remplit les champs et affiche "Modifier" a la place de "Ajouter".
 * Les deux modes delegent a Better Auth :
 * - creation : authClient.admin.createUser cree le compte sans mot de passe, puis
 *   authClient.requestPasswordReset envoie le meme lien "choisir son mot de passe" que pour
 *   un oubli (cf. ForgotPassword.tsx).
 * - edition : authClient.admin.updateUser met a jour email/name/role.
 * @param {AddUserModalProps} props Proprietes de controle de la modale.
 * @param {boolean} props.isOpen Definit si la modale est ouverte.
 * @param {() => void} props.onClose Ferme la modale.
 * @param {(user) => void} props.handleUserSaved Met a jour la liste des users et ferme la modale.
 * @param {UserItem | null} props.userToEdit Utilisateur a modifier — pre-remplit le formulaire si defini.
 * @children ModalCloseButton Ferme la modale.
 */
export default function AddUserModal({
  isOpen,
  onClose,
  handleUserSaved,
  userToEdit = null,
}: AddUserModalProps) {
  // Determine si la modale est en mode ajout ou modification
  const isEditMode = userToEdit !== null;

  // Initialise les champs depuis userToEdit en mode modification, vide en mode creation
  const displayName = userToEdit?.name?.trim() ?? "";
  // Decoupe le nom complet en prenom et nom de famille (tout ce qui suit le premier espace)
  const [initialFirstName, ...initialLastNameParts] = displayName.split(/\s+/);

  // Champs du formulaire utilisateur
  const [firstName, setFirstName] = useState(initialFirstName ?? "");
  const [lastName, setLastName] = useState(initialLastNameParts.join(" "));
  const [email, setEmail] = useState(userToEdit?.email ?? "");
  const [role, setRole] = useState(userToEdit?.role ?? "");

  // Etat de l'appel Better Auth (createUser ou updateUser selon le mode)
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Verifie si le formulaire d'ajout utilisateur est incomplet.
  const isFormInvalid = isAddUserFormInvalid(firstName, lastName, email, role);

  //Reinitialise le formulaire a son etat initial
  const resetForm = () => {
    const name = userToEdit?.name?.trim() ?? "";
    const [first, ...rest] = name.split(/\s+/);
    setFirstName(first ?? "");
    setLastName(rest.join(" "));
    setEmail(userToEdit?.email ?? "");
    setRole(userToEdit?.role ?? "");
  };

  // Gere la soumission du formulaire d'ajout ou de modification d'utilisateur
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Si le formulaire est invalide, on ne fait rien
    if (isFormInvalid) return;

    // Concatene prenom et nom de famille pour former le nom complet
    const name = `${firstName} ${lastName}`.trim();

    // Indique que l'appel API est en cours et reinitialise l'erreur de sauvegarde
    setIsSaving(true);
    setSaveError(null);

    // si on est en mode edition, on met a jour l'utilisateur existant via Better Auth
    if (isEditMode) {
      // Delegue a Better Auth
      const updateResult = await authClient.admin.updateUser({
        userId: userToEdit.id,
        data: { email, name, role: role as never },
      });

      setIsSaving(false);

      // Si l'update a echoue, on affiche l'erreur et on ne ferme pas la modale
      if (updateResult.error) {
        setSaveError(updateResult.error.message ?? "Une erreur est survenue.");
        return;
      }

      // Si l'update a reussi, on reinitialise le formulaire et on notifie le parent pour mettre a jour la liste des utilisateurs
      resetForm();
      handleUserSaved({
        id: updateResult.data.id,
        email: updateResult.data.email,
        name: updateResult.data.name,
        role: updateResult.data.role as UserItem["role"],
        created_at: new Date(updateResult.data.createdAt).toISOString(),
      });
      return;
    }

    // Creation : delegue a Better Auth. Cree le compte sans mot de passe.
    const createResult = await authClient.admin.createUser({
      email,
      name,
      role: role as never,
    });

      // Si la creation a echoue, on affiche l'erreur et on ne ferme pas la modale
    if (createResult.error) {
      setIsSaving(false);
      setSaveError(createResult.error.message ?? "Une erreur est survenue.");
      return;
    }

    // Si la creation a reussi, on envoie un email de reinitialisation de mot de passe
    await authClient.requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    // On reinitialise le formulaire et on notifie le parent pour mettre a jour la liste des utilisateurs
    setIsSaving(false);
    resetForm();
    handleUserSaved({
      id: createResult.data.user.id,
      email: createResult.data.user.email,
      name: createResult.data.user.name,
      role: createResult.data.user.role as UserItem["role"],
      created_at: new Date(createResult.data.user.createdAt).toISOString(),
    });
  };

  // Ferme la modale et reinitialise le formulaire
  const handleClose = () => {
    setIsSaving(false);
    setSaveError(null);
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
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="submit-modal-area">
            <button
              type="submit"
              className="btn-cta"
              disabled={isFormInvalid || isSaving}
            >
              {isEditMode ? "Modifier" : "Ajouter"}
            </button>
          </div>
          {saveError ? <p className="error-message">{saveError}</p> : null}
        </form>
      </div>
    </Modal>
  );
}
