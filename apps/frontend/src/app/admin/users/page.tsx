"use client";

import SideBarTool from "../../../components/SideBarTool";
import { filterUsersItems } from "../../../config/navigation";
import AddButton from "../../../components/AddButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, type FormEvent } from "react";
import Modal from "react-modal";
import ModalCloseButton from "../../../components/ModalCloseButton";
import UsersContent from "./UsersContent";
import { apiRequest } from "../../../functions/apiRequest";
import { getApiErrorMessage } from "../../../functions/getApiErrorMessage";

/** Affiche la page d'administration des utilisateurs.
 * Affiche les filtres (sidebar + modal mobile) et la liste des utilisateurs.
 * Ouvre une modale permettant d'ajouter un utilisateur (formulaire).
 * @children SideBarTool : Affiche une navigation sticky sur desktop
 * @children AddButton : Affiche la navigation des filtres sur mobile
 * @children UsersContent : Affiche le contenu de la page utilisateurs
 * @children ModalCloseButton : Ferme la modale
 */
export default function Page() {
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const isFormInvalid =
    firstName.trim() === "" ||
    lastName.trim() === "" ||
    email.trim() === "" ||
    role.trim() === "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isFormInvalid) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setTemporaryPassword(null);

    const result = await apiRequest<{
      message: string;
      temporary_password?: string;
    }>("/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
        role,
      }),
    });

    if (result.error) {
      setSubmitError(getApiErrorMessage(result.error));
      setIsSubmitting(false);
      return;
    }

    setTemporaryPassword(result.data.temporary_password ?? null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setRole("");
    setRefreshToken((currentValue) => currentValue + 1);
    setIsSubmitting(false);
  };

  useEffect(() => {
    Modal.setAppElement("#app-root");
  }, []);

  return (
    <>
      <section className="section-page">
        <div className="flex justify-center item-center gap-(--gap-content-small)">
          <AddButton items={filterUsersItems} />
          <h1 className="title1">UTILISATEURS</h1>
          <button
            type="button"
            className="mb-(--margin-bottom-title)"
            aria-label="Ouvrir les filtres"
            onClick={() => setIsOpen(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <SideBarTool items={filterUsersItems}>
          <UsersContent refreshToken={refreshToken} />
        </SideBarTool>
      </section>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="Filtres"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <ModalCloseButton onClose={() => setIsOpen(false)} />
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
                {isSubmitting ? "Ajout..." : "Ajouter"}
              </button>
            </div>
            {submitError ? (
              <p className="text-center text-(--color-1)">{submitError}</p>
            ) : null}
            {temporaryPassword ? (
              <p className="text-center">
                Mot de passe temporaire: <strong>{temporaryPassword}</strong>
              </p>
            ) : null}
          </form>
        </div>
      </Modal>
    </>
  );
}
