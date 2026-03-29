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
 * Gere le filtre actif par jour et le transmet a LineupContent.
 * Ouvre une modale permettant d'ajouter un artiste.
 * @children SideBarTool : Affiche une navigation sticky sur desktop
 * @children AddButton : Affiche la navigation des filtres sur mobile
 * @children LineupContent : Affiche le contenu de la page artistes filtree
 */
export default function Page() {
  useRoleGuard();

  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const items = filterLineUpItems.map((item) => ({
    ...item,
    active: item.value === activeFilter || (item.value === undefined && activeFilter === null),
    onClick: () => setActiveFilter(item.value ?? null),
  }));

  return (
    <section className="section-page">
      <div className="flex justify-center item-center gap-(--space-md)">
        <AddButton items={items} />
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

      <SideBarTool items={items}>
        <LineupContent
          isAddModalOpen={isOpen}
          onCloseAddModal={() => setIsOpen(false)}
          activeFilter={activeFilter}
        />
      </SideBarTool>
    </section>
  );
}
