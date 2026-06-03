"use client";

import { useState } from "react";
import { useModal } from "../../../hooks/useModal";
import SideBarTool from "../../../components/SideBarTool";
import { filterNewsItems } from "../../../config/ui";
import MobileFiltersButton from "../../../components/MobileFiltersButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import NewsContent from "../../../components/NewsContent";
import { useRoleGuard } from "../../../hooks/useRoleGuard";

/** Page admin de gestion des news.
 * Affiche les filtres et la liste des news.
 * Gere le filtre actif (tri) et le transmet a NewsContent.
 * Ouvre une modale permettant d'ajouter une news.
 * @function useRoleGuard Redirige les utilisateurs non autorisés.
 * @function useModal Gère l'état d'ouverture de la modale d'ajout de news.
 * @function filterNewsItems Liste des options de tri pour les news.
 * @children SideBarTool Affiche une navigation sticky sur desktop.
 * @children MobileFiltersButton Affiche la navigation des filtres sur mobile.
 * @children NewsContent Affiche la liste des news filtree.
 */
export default function Page() {
  // Applique les restrictions de rôle pour accéder à cette page admin
  useRoleGuard();

  // Gere l'ouverture et la fermeture de la modale d'ajout d'artiste et le filtre actif
  const { isOpen, open, close } = useModal();
  const [activeFilter, setActiveFilter] = useState("Plus récent");

  // Mappe les items de filtre pour ajouter la logique d'activation et de clic
  const items = filterNewsItems.map((item) => ({
    ...item,
    active: item.labelBtn === activeFilter,
    onClick: () => setActiveFilter(item.labelBtn ?? "Plus récent"),
  }));

  return (
    <section className="section-page">
      <div className="filter-row">
        <MobileFiltersButton items={items} />
        <h1 className="title1">News</h1>
        <button
          type="button"
          className="mb-(--ctx-title-mb)"
          aria-label="Ajouter une news"
          onClick={() => open()}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      <SideBarTool items={items}>
        <NewsContent
          isAddModalOpen={isOpen}
          onCloseAddModal={close}
          activeFilter={activeFilter}
        />
      </SideBarTool>
    </section>
  );
}
