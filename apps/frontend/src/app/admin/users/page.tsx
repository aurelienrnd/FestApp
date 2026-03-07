"use client";

import SideBarTool from "../../../components/SideBarTool";
import { filterUsersItems } from "../../../config/navigation";
import AddButton from "../../../components/AddButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import UsersContent from "./UsersContent";
import AddUserModal from "./AddUserModal";

/** Affiche la page d'administration des utilisateurs.
 * Affiche les filtres (sidebar + modal mobile) et la liste des utilisateurs.
 * Ouvre une modale permettant d'ajouter un utilisateur (formulaire).
 * Vérifie si le token a été modifié ; si c'est le cas, cela indique qu'une requête a été effectuée.
 * @children SideBarTool : Affiche une navigation sticky sur desktop
 * @children AddButton : Affiche la navigation des filtres sur mobile
 * @children UsersContent : Affiche le contenu de la page utilisateurs
 * @children AddUserModal : Gere la modale et le formulaire d'ajout
 */
export default function Page() {
  // Initialise l'état d'ouverture de la modal
  const [isOpen, setIsOpen] = useState(false);

  // Indique si le token a été modifié
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <>
      {/** Page Principal */}
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

      {/** Maldal pour ajouter un utilisateur */}
      <AddUserModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUserCreated={() =>
          setRefreshToken((currentValue) => currentValue + 1)
        }
      />
    </>
  );
}
