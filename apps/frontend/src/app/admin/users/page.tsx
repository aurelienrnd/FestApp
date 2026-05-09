"use client";

import SideBarTool from "../../../components/SideBarTool";
import { filterUsersItems } from "../../../config/ui";
import AddButton from "../../../components/AddButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useModal } from "../../../hooks/useModal";
import UsersContent from "./UsersContent";
import { useRoleGuard } from "../../../hooks/useRoleGuard";

/** Affiche la page d'administration des utilisateurs.
 * Affiche les filtres (sidebar + modal mobile) et la liste des utilisateurs.
 * Ouvre une modale permettant d'ajouter un utilisateur (formulaire).
 * @children SideBarTool : Affiche une navigation sticky sur desktop
 * @children AddButton : Affiche la navigation des filtres sur mobile
 * @children UsersContent : Affiche le contenu de la page utilisateurs
 */
export default function Page() {
  useRoleGuard();

  const { isOpen, open, close } = useModal();

  // Etat du filtre utilisateurs (tout / admin / lineup / news)
  const [userFilter, setUserFilter] = useState<
    "all" | "admin" | "lineup" | "news"
  >("all");

  //Determine quelle option est utilisé
  const userFilterItems = filterUsersItems.map((item) => ({
    ...item, // On copie toutes les propriétés existantes de l'item

    //Détermine si l'item est actif
    active: item.value === userFilter,

    // Si l'item possède une valeur on définit une fonction onClick qui met à jour le filtre
    onClick: item.value
      ? () => setUserFilter(item.value as "all" | "admin" | "lineup" | "news")
      : undefined,
  }));

  return (
    <>
      <section className="section-page">
        <div className="filter-row">
          <AddButton items={userFilterItems} />
          <h1 className="title1">UTILISATEURS</h1>
          <button
            type="button"
            className="mb-(--ctx-title-mb)"
            aria-label="Ouvrir les filtres"
            onClick={() => open()}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        <SideBarTool items={userFilterItems}>
          <UsersContent
            isAddModalOpen={isOpen}
            onCloseAddModal={close}
            filterBy={userFilter}
          />
        </SideBarTool>
      </section>
    </>
  );
}
