"use client";

import { useState } from "react";
import SideBarTool from "../../../components/SideBarTool";
import { filterArtistsItems } from "../../../config/ui";
import MobileFiltersButton from "../../../components/MobileFiltersButton";
import ArtistsContent from "../../../components/ArtistsContent";

/** Page publique de la programmation du festival.
 * Gere le filtre actif par jour et le transmet a ArtistsContent.
 * @children MobileFiltersButton : Affiche la navigation des filtres sur mobile
 * @children SideBarTool : Affiche une navigation sticky sur desktop
 * @children ArtistsContent : Affiche la liste des artistes filtree
 */
export default function Page() {
  // Gere le filtre actif pour la programmation (ex: jour 1, jour 2, etc.)
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Prepare les items de navigation en injectant l'etat actif et les handlers de clic
  const items = filterArtistsItems.map((item) => ({
    ...item,
    active:
      item.value === activeFilter ||
      (item.value === undefined && activeFilter === null), // Si item.value est undefined, il correspond a "Tous" et est actif si aucun filtre n'est actif

    // Met a jour le filtre actif lors du clic sur un item
    onClick: () => setActiveFilter(item.value ?? null),
  }));

  return (
    <section className="section-page">
      <div className="filter-row">
        <MobileFiltersButton items={items} />
        <h1 className="title1">Programmation</h1>
      </div>
      <SideBarTool items={items}>
        <ArtistsContent activeFilter={activeFilter} />
      </SideBarTool>
    </section>
  );
}
