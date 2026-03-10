"use client";

import SideBarTool from "../../../components/SideBarTool";
import { filterUsersItems } from "../../../config/navigation";
import AddButton from "../../../components/AddButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import UsersContent from "./UsersContent";

/** Affiche la page d'administration des utilisateurs.
 * Affiche les filtres (sidebar + modal mobile) et la liste des utilisateurs.
 * Ouvre une modale permettant d'ajouter un utilisateur (formulaire).
 * @children SideBarTool : Affiche une navigation sticky sur desktop
 * @children AddButton : Affiche la navigation des filtres sur mobile
 * @children UsersContent : Affiche le contenu de la page utilisateurs
 */
export default function Page() {
  // Initialise l'etat d'ouverture de la modal pour ajouter un utilisateur
  const [isOpen, setIsOpen] = useState(false);

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
          <UsersContent
            isAddModalOpen={isOpen}
            onCloseAddModal={() => setIsOpen(false)}
          />
        </SideBarTool>
      </section>
    </>
  );
}
