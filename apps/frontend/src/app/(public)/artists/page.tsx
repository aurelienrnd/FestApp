"use client";

import { useState } from "react";
import SideBarTool from "../../../components/SideBarTool";
import { filterartistsItems } from "../../../config/ui";
import AddButton from "../../../components/AddButton";
import ArtistsContent from "../../../components/ArtistsContent";

/** Page publique de la programmation du festival.
 * Gere le filtre actif par jour et le transmet a ArtistsContent.
 * @children AddButton : Affiche la navigation des filtres sur mobile
 * @children SideBarTool : Affiche une navigation sticky sur desktop
 * @children ArtistsContent : Affiche la liste des artistes filtree
 */
export default function Page() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const items = filterartistsItems.map((item) => ({
    ...item,
    active:
      item.value === activeFilter ||
      (item.value === undefined && activeFilter === null),
    onClick: () => setActiveFilter(item.value ?? null),
  }));

  return (
    <section className="section-page">
      <div className="filter-row">
        <AddButton items={items} />
        <h1 className="title1">Programmation</h1>
      </div>
      <SideBarTool items={items}>
        <ArtistsContent basePath="/artists" activeFilter={activeFilter} />
      </SideBarTool>
    </section>
  );
}
