"use client";

import { useState } from "react";
import SideBarTool from "../../../components/SideBarTool";
import { filterNewsItems } from "../../../config/ui";
import MobileFiltersButton from "../../../components/MobileFiltersButton";
import NewsContent from "../../../components/NewsContent";

/** Page publique des news du festival.
 * Gere le filtre actif (tri) et le transmet a NewsContent.
 * @children MobileFiltersButton Affiche la navigation des filtres sur mobile.
 * @children SideBarTool Affiche une navigation sticky sur desktop.
 * @children NewsContent Affiche la liste des news filtree.
 */
export default function Page() {
  // Gere le filtre actif pour le tri des news (ex: plus recent, plus ancien, etc.)
  const [activeFilter, setActiveFilter] = useState("Plus récent");

  // Prepare les items de navigation en injectant l'etat actif et les handlers de clic
  const items = filterNewsItems.map((item) => ({
    ...item,
    active: item.labelBtn === activeFilter,

    // Met a jour le filtre actif lors du clic sur un item
    onClick: () => setActiveFilter(item.labelBtn ?? "Plus récent"),
  }));

  return (
    <section className="section-page">
      <div className="filter-row">
        <MobileFiltersButton items={items} />
        <h1 className="title1">News</h1>
      </div>
      <SideBarTool items={items}>
        <NewsContent activeFilter={activeFilter} />
      </SideBarTool>
    </section>
  );
}
