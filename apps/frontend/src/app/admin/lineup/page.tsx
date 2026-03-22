"use client";

import { useState } from "react";
import SideBarTool from "../../../components/SideBarTool";
import { filterLineUpItems } from "../../../config/navigation";
import AddButton from "../../../components/AddButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import LineupContent from "./LineupContent";
import { useRoleGuard } from "../../../hooks/useRoleGuard";

/** Page admin de gestion des artistes.
 * Affiche les filtres et la liste des artistes.
 * Ouvre une modale permettant d'ajouter un artiste.
 * @children SideBarTool : Affiche une navigation sticky sur desktop
 * @children AddButton : Affiche la navigation des filtres sur mobile
 * @children LineupContent : Affiche le contenu de la page artistes
 */
export default function Page() {
  useRoleGuard();

  // Initialise l'etat d'ouverture de la modal pour ajouter un artiste
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="section-page">
      <div className="flex justify-center item-center gap-(--space-md)">
        <AddButton items={filterLineUpItems} />
        <h1 className="title1">Programation</h1>
        <button
          type="button"
          className="mb-(--margin-bottom-title)"
          aria-label="Ouvrir les filtres"
          onClick={() => setIsOpen(true)}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      <SideBarTool items={filterLineUpItems}>
        <LineupContent
          isAddModalOpen={isOpen}
          onCloseAddModal={() => setIsOpen(false)}
        />
      </SideBarTool>
    </section>
  );
}
