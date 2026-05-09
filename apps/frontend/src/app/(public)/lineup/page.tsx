"use client";

import { useState } from "react";
import SideBarTool from "../../../components/SideBarTool";
import { filterLineUpItems } from "../../../config/ui";
import AddButton from "../../../components/AddButton";
import LineupContent from "../../../components/LineupContent";

/** Page publique de la programmation du festival.
 * Gere le filtre actif par jour et le transmet a LineupContent.
 * @children AddButton : Affiche la navigation des filtres sur mobile
 * @children SideBarTool : Affiche une navigation sticky sur desktop
 * @children LineupContent : Affiche la liste des artistes filtree
 */
export default function Page() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const items = filterLineUpItems.map((item) => ({
    ...item,
    active: item.value === activeFilter || (item.value === undefined && activeFilter === null),
    onClick: () => setActiveFilter(item.value ?? null),
  }));

  return (
    <section className="section-page">
      <div className="filter-row">
        <AddButton items={items} />
        <h1 className="title1">Lineup</h1>
      </div>
      <SideBarTool items={items}>
        <LineupContent basePath="/lineup" activeFilter={activeFilter} />
      </SideBarTool>
    </section>
  );
}
