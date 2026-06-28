"use client";

import { useState } from "react";
import { useModal } from "../../../hooks/useModal";
import SideBarTool from "../../../components/SideBarTool";
import { filterArtistsItems } from "../../../config/ui";
import MobileFiltersButton from "../../../components/MobileFiltersButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import ArtistsContent from "../../../components/ArtistsContent";
import { useRoleGuard } from "../../../hooks/useRoleGuard";

/** Page admin de gestion des artistes.
 * Affiche les filtres et la liste des artistes.
 * Gere le filtre actif par jour et le transmet a ArtistsContent.
 * Ouvre une modale permettant d'ajouter un artiste.
 * @function useRoleGuard : Verifie que l'utilisateur a les droits d'accès à la page admin
 * @function useModal : Gere l'ouverture et la fermeture de la modale d'ajout d'artiste
 * @function filterArtistsItems : Liste des items de filtre pour les artistes
 * @children SideBarTool : Affiche une navigation sticky sur desktop
 * @children MobileFiltersButton : Affiche la navigation des filtres sur mobile
 * @children ArtistsContent : Affiche le contenu de la page artistes filtree
 */
export default function Page() {
  // Verifie que l'utilisateur a les droits d'accès à la page admin
  useRoleGuard();

  // Gere l'ouverture et la fermeture de la modale d'ajout d'artiste et le filtre actif
  const { isOpen, open, close } = useModal();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Mappe les items de filtre pour ajouter la logique d'activation et de clic
  const items = filterArtistsItems.map((item) => ({
    ...item,
    active:
      item.value === activeFilter ||
      (item.value === undefined && activeFilter === null),
    onClick: () => setActiveFilter(item.value ?? null),
  }));

  return (
    <section className="section-page">
      <div className="filter-row">
        <MobileFiltersButton items={items} />
        <h1 className="title1">programmation</h1>
        <button
          type="button"
          className="mb-(--ctx-title-mb)"
          aria-label="Ajouter un artiste"
          onClick={() => open()}
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      <SideBarTool items={items}>
        <ArtistsContent
          isAddModalOpen={isOpen}
          onCloseAddModal={close}
          activeFilter={activeFilter}
        />
      </SideBarTool>
    </section>
  );
}
